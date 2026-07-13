import { useEffect, useRef, useState } from "react";
import { excuseApi } from "../../api/excuseApi";

const MAX_ROUND = 5;

function buildInitialThread(excuse) {
  if (!excuse) return [];

  const roundNumber = excuse.roundNumber ?? 1;
  const isReplyRound = Boolean(excuse.incomingMessage);

  return [
    {
      id: excuse.id,
      roundNumber,
      type: isReplyRound ? "답장" : "원본",
      incomingMessage: excuse.incomingMessage,
      excuseText: excuse.excuse,
    },
  ];
}

export default function ReplyThreadSection({ excuse, onReplySuccess }) {
  const [thread, setThread] = useState(() => buildInitialThread(excuse));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [incomingMessage, setIncomingMessage] = useState("");
  const [replyError, setReplyError] = useState("");
  const [isServerRoundLimitReached, setIsServerRoundLimitReached] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    setThread((prev) => {
      if (prev.some((item) => item.id === excuse?.id)) return prev;
      return buildInitialThread(excuse);
    });
    setIsFormOpen(false);
    setIncomingMessage("");
    setReplyError("");
    setIsServerRoundLimitReached(false);
  }, [excuse?.id]);

  useEffect(() => {
    if (isFormOpen) textareaRef.current?.focus();
  }, [isFormOpen]);

  const currentRound = excuse?.roundNumber ?? 1;
  const isRoundLimitReached = currentRound >= MAX_ROUND || isServerRoundLimitReached;
  const hasComplexityWarning = Boolean(excuse?.complexityWarning?.message);

  async function handleReplySubmit(event) {
    event.preventDefault();

    const trimmedMessage = incomingMessage.trim();

    if (!trimmedMessage) {
      setReplyError("상대방의 답장 내용을 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      setReplyError("");

      const replyResult = await excuseApi.replyToExcuse({
        excuseId: excuse.id,
        incomingMessage: trimmedMessage,
      });

      const nextReply = {
        ...replyResult,
        situation: replyResult.situation ?? excuse.situation,
      };

      setThread((prev) => [
        ...prev,
        {
          id: nextReply.id,
          roundNumber: nextReply.roundNumber ?? (currentRound + 1),
          type: "답장",
          incomingMessage: trimmedMessage,
          excuseText: nextReply.excuse,
        },
      ]);
      setIncomingMessage("");
      setIsFormOpen(false);
      onReplySuccess?.(nextReply);
    } catch (error) {
      if (error.status === 409) {
        setIsFormOpen(false);
        setIsServerRoundLimitReached(true);
        setReplyError("");
      } else {
        setReplyError(error.message || "답장 준비에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section aria-label="대화 스레드" className="mt-6 border border-border-soft rounded-lg p-6 sm:p-8">
      <h2 className="text-base font-bold text-navy-950">대화 스레드</h2>
      <p className="mt-1.5 text-sm font-normal text-navy-500">
        상대방이 실제로 뭐라고 답장했는지 알려주시면, 그 내용에 이어지는 다음 변명을 준비해드려요.
      </p>

      <ol className="mt-5 space-y-3">
        {thread.map((item) => (
          <li key={`${item.id}-${item.roundNumber}`} className="rounded-md bg-surface-soft p-4">
            <span className="px-2 py-0.5 text-[11px] font-bold text-white bg-brand-primary rounded-md whitespace-nowrap">
              {item.roundNumber}라운드 · {item.type}
            </span>
            {item.incomingMessage && (
              <p className="mt-2 text-xs font-normal text-navy-500">
                상대방: "{item.incomingMessage}"
              </p>
            )}
            <p className="mt-2 text-sm font-normal text-navy-900 leading-relaxed">
              "{item.excuseText}"
            </p>
          </li>
        ))}
      </ol>

      {!isFormOpen && !isRoundLimitReached && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="px-5 py-2.5 text-sm font-bold text-white bg-brand-primary rounded-md shadow-[0_4px_10px_rgba(21,126,251,0.18)] hover:bg-brand-primary-hover hover:shadow-[0_5px_12px_rgba(21,126,251,0.22)] transition-all"
          >
            답장 준비하기
          </button>
        </div>
      )}

      {isFormOpen && (
        <form onSubmit={handleReplySubmit} className="mt-5">
          <div className="flex flex-col gap-2">
            <label htmlFor={`incoming-message-${excuse.id}`} className="text-sm font-bold text-navy-700">
              상대방이 보낸 답장
            </label>
            <textarea
              ref={textareaRef}
              id={`incoming-message-${excuse.id}`}
              maxLength={500}
              rows={3}
              placeholder="예: 진짜? 정전 안내 문자 좀 보여줘봐"
              value={incomingMessage}
              onChange={(event) => {
                setIncomingMessage(event.target.value);
                setReplyError("");
              }}
              className="w-full rounded-md border border-border-input px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-[#a3b2c7] focus:outline-none focus:border-brand-primary transition resize-none"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs font-normal text-navy-300">
                {incomingMessage.length}/500
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsFormOpen(false);
                    setIncomingMessage("");
                    setReplyError("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-navy-950 border border-border-input rounded-md hover:bg-brand-primary-soft transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-bold text-white bg-brand-primary rounded-md hover:bg-brand-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "생성 중..." : "답장 생성하기"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {replyError && (
        <p role="alert" className="mt-4 text-sm font-medium text-danger-text bg-danger-bg rounded-md px-3.5 py-2.5">
          {replyError}
        </p>
      )}

      {hasComplexityWarning && (
        <p className="mt-4 text-sm font-medium text-suspicion-medium-text bg-suspicion-medium-bg rounded-md px-3.5 py-2.5">
          ⚠️ {excuse.complexityWarning.message}
        </p>
      )}

      {isRoundLimitReached && (
        <p className="mt-4 text-sm font-normal text-navy-300 bg-surface-soft rounded-md px-3.5 py-2.5">
          최대 5라운드까지 진행했어요. 더 이상 답장을 준비할 수 없습니다.
        </p>
      )}
    </section>
  );
}

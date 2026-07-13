import { useEffect, useRef, useState } from "react";
import { excuseApi } from "../../api/excuseApi";
import CopyTextButton from "./CopyTextButton";

const MAX_ROUND = 5;

function buildInitialThread(excuse) {
    if (!excuse) return [];

    const roundNumber = excuse.roundNumber ?? 1;
    const isReplyRound = Boolean(excuse.incomingMessage);
    const replyOptions = normalizeReplyOptions(excuse);

    return [
        {
            id: excuse.id,
            roundNumber,
            type: isReplyRound ? "답장" : "원본",
            incomingMessage: excuse.incomingMessage,
            excuseText: excuse.excuse,
            replyOptions,
            selectedOptionIndex: 0,
        },
    ];
}

function normalizeReplyOptions(excuse) {
    const options = Array.isArray(excuse?.replyOptions)
        ? excuse.replyOptions.filter((option) => option && option.trim())
        : [];

    if (options.length > 0) return options.slice(0, 3);
    return excuse?.excuse ? [excuse.excuse] : [];
}

function OptionCheckIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="w-2.5 h-2.5"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M5 13l4 4L19 7" />
        </svg>
    );
}

export default function ReplyThreadSection({ excuse, onReplySuccess }) {
    const [thread, setThread] = useState(() => buildInitialThread(excuse));
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [incomingMessage, setIncomingMessage] = useState("");
    const [replyError, setReplyError] = useState("");
    const [isServerRoundLimitReached, setIsServerRoundLimitReached] =
        useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (isFormOpen) textareaRef.current?.focus();
    }, [isFormOpen]);

    const currentRound = excuse?.roundNumber ?? 1;
    const isRoundLimitReached =
        currentRound >= MAX_ROUND || isServerRoundLimitReached;
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
            const replyOptions = normalizeReplyOptions(nextReply);

            setThread((prev) => [
                ...prev,
                {
                    id: nextReply.id,
                    roundNumber: nextReply.roundNumber ?? currentRound + 1,
                    type: "답장",
                    incomingMessage: trimmedMessage,
                    excuseText: replyOptions[0] ?? nextReply.excuse,
                    replyOptions,
                    selectedOptionIndex: 0,
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
                setReplyError(
                    error.message ||
                        "답장 준비에 실패했습니다. 잠시 후 다시 시도해주세요."
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleSelectReplyOption(threadIndex, optionIndex) {
        setThread((prev) =>
            prev.map((item, index) => {
                if (index !== threadIndex) return item;

                return {
                    ...item,
                    selectedOptionIndex: optionIndex,
                    excuseText: item.replyOptions?.[optionIndex] ?? item.excuseText,
                };
            })
        );
    }

    return (
        <section
            aria-label="대화 스레드"
            className="mt-6 border border-border-soft rounded-lg p-6 sm:p-8"
        >
            <h2 className="text-base font-bold text-navy-950">대화 스레드</h2>
            <p className="mt-1.5 text-sm font-normal text-navy-500">
                상대방이 실제로 뭐라고 답장했는지 알려주시면, 그 내용에 이어지는
                다음 변명을 준비해드려요.
            </p>

            <ol className="mt-5 space-y-3">
                {thread.map((item, threadIndex) => {
                    const isLatest = threadIndex === thread.length - 1;
                    const shouldShowOptions =
                        isLatest &&
                        item.type === "답장" &&
                        item.replyOptions?.length > 1;

                    return (
                    <li
                        key={`${item.id}-${item.roundNumber}`}
                        className="rounded-md bg-surface-soft p-4"
                    >
                        <span className="text-[11px] font-bold text-brand-primary whitespace-nowrap">
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

                        {shouldShowOptions && (
                            <div className="mt-4">
                                <p className="text-xs font-bold text-navy-700">
                                    다른 답장 후보{" "}
                                    <span className="font-normal text-navy-300">
                                        · 마음에 드는 답장을 선택하거나 복사하세요
                                    </span>
                                </p>
                                <div className="mt-2 space-y-2">
                                    {item.replyOptions.map((option, optionIndex) => {
                                        const isSelected =
                                            optionIndex === item.selectedOptionIndex;

                                        return (
                                            <div
                                                key={`${item.id}-${option}`}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() =>
                                                    handleSelectReplyOption(
                                                        threadIndex,
                                                        optionIndex
                                                    )
                                                }
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key === "Enter" ||
                                                        event.key === " "
                                                    ) {
                                                        event.preventDefault();
                                                        handleSelectReplyOption(
                                                            threadIndex,
                                                            optionIndex
                                                        );
                                                    }
                                                }}
                                                className={[
                                                    "w-full flex items-start gap-2.5 rounded-md border p-3 text-left text-sm cursor-pointer transition-colors",
                                                    isSelected
                                                        ? "border-brand-primary bg-brand-primary-soft"
                                                        : "border-border-soft bg-white hover:border-[#bedafd]",
                                                ].join(" ")}
                                                aria-pressed={isSelected}
                                            >
                                                <span
                                                    className={[
                                                        "mt-0.5 w-4 h-4 rounded-full border shrink-0 flex items-center justify-center",
                                                        isSelected
                                                            ? "border-brand-primary bg-brand-primary"
                                                            : "border-border-input bg-white",
                                                    ].join(" ")}
                                                    aria-hidden="true"
                                                >
                                                    {isSelected && <OptionCheckIcon />}
                                                </span>
                                                <span
                                                    className={[
                                                        "flex-1",
                                                        isSelected
                                                            ? "font-medium text-navy-950"
                                                            : "font-normal text-navy-700",
                                                    ].join(" ")}
                                                >
                                                    "{option}"
                                                </span>
                                                <CopyTextButton
                                                    text={option}
                                                    label="이 답장 복사"
                                                    copiedLabel="복사됨"
                                                    iconOnly
                                                    className="shrink-0 text-[#a3b2c7] hover:text-brand-primary transition-colors"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </li>
                    );
                })}
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
                        <label
                            htmlFor={`incoming-message-${excuse.id}`}
                            className="text-sm font-bold text-navy-700"
                        >
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
                                    {isSubmitting
                                        ? "생성 중..."
                                        : "답장 생성하기"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            )}

            {replyError && (
                <p
                    role="alert"
                    className="mt-4 text-sm font-medium text-danger-text"
                >
                    {replyError}
                </p>
            )}

            {hasComplexityWarning && (
                <p className="mt-4 text-sm font-medium text-suspicion-medium-text">
                    ⚠️ {excuse.complexityWarning.message}
                </p>
            )}

            {isRoundLimitReached && (
                <p className="mt-4 text-sm font-normal text-navy-300">
                    최대 5라운드까지 진행했어요. 더 이상 답장을 준비할 수
                    없습니다.
                </p>
            )}
        </section>
    );
}

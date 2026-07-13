import { useEffect, useRef, useState } from "react";
import { excuseApi } from "../../api/excuseApi";
import ComplexityWarningModal from "../common/ComplexityWarningModal";
import CopyTextButton from "./CopyTextButton";
import { getComplexityWarningMessage } from "../../utils/complexityWarning";

const MAX_ROUND = 5;

function buildInitialThread(excuse) {
    if (!excuse) return [];

    const savedThread = Array.isArray(excuse.thread) ? excuse.thread : [];

    if (savedThread.length > 0) {
        return savedThread.map((item, index) => {
            const isLatest = index === savedThread.length - 1;
            const typeLabels = {
                ORIGINAL: "원본",
                EVOLVE: "진화",
                REPLY: "답장",
            };
            const replyOptions =
                isLatest && item.type === "REPLY"
                    ? normalizeReplyOptions(excuse)
                    : [item.excuse];

            return {
                id: item.id,
                roundNumber: item.roundNumber ?? 1,
                type: typeLabels[item.type] ?? "원본",
                incomingMessage: item.incomingMessage,
                excuseText: item.excuse,
                replyOptions,
                selectedOptionIndex: 0,
            };
        });
    }

    return [
        {
            id: excuse.id,
            roundNumber: excuse.roundNumber ?? 1,
            type: excuse.incomingMessage ? "답장" : "원본",
            incomingMessage: excuse.incomingMessage,
            excuseText: excuse.excuse,
            replyOptions: normalizeReplyOptions(excuse),
            selectedOptionIndex: 0,
        },
    ];
}

function normalizeReplyOptions(excuse) {
    const candidates = [
        excuse?.excuse,
        ...(Array.isArray(excuse?.replyOptions) ? excuse.replyOptions : []),
    ];

    return candidates.reduce((options, option) => {
        const trimmedOption = typeof option === "string" ? option.trim() : "";

        if (!trimmedOption || options.includes(trimmedOption)) return options;
        return [...options, trimmedOption];
    }, []);
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
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(() =>
        Boolean(
            excuse?.incomingMessage &&
            excuse?.complexityWarning?.enabled &&
            excuse?.complexityWarning?.message
        )
    );
    const textareaRef = useRef(null);

    useEffect(() => {
        if (isFormOpen) textareaRef.current?.focus();
    }, [isFormOpen]);

    const currentRound = excuse?.roundNumber ?? 1;
    const isRoundLimitReached =
        currentRound >= MAX_ROUND || isServerRoundLimitReached;
    const hasComplexityWarning = Boolean(
        excuse?.incomingMessage &&
        excuse?.complexityWarning?.enabled &&
        excuse?.complexityWarning?.message
    );

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

            const selectedCurrentExcuse =
                thread[thread.length - 1]?.excuseText ?? excuse.excuse;

            const replyResult = await excuseApi.replyToExcuse({
                excuseId: excuse.id,
                incomingMessage: trimmedMessage,
                currentExcuse: selectedCurrentExcuse,
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
            className="mt-8 border border-border-soft border-t-4 border-t-brand-primary rounded-2xl p-7 sm:p-10"
        >
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-950">
                대화 스레드
            </h2>
            <p className="mt-2 text-base font-normal leading-relaxed text-navy-500">
                상대방이 실제로 뭐라고 답장했는지 알려주시면, 그 내용에 이어지는
                다음 변명을 준비해드려요.
            </p>

            <ol className="mt-7 space-y-4">
                {thread.map((item, threadIndex) => {
                    const isLatest = threadIndex === thread.length - 1;
                    const shouldShowOptions =
                        isLatest &&
                        item.type === "답장" &&
                        item.replyOptions?.length > 1;

                    return (
                    <li
                        key={`${item.id}-${item.roundNumber}`}
                        className="rounded-lg bg-surface-soft p-5 sm:p-7"
                    >
                        <span className="text-sm font-bold text-brand-primary whitespace-nowrap">
                            {item.roundNumber}라운드 · {item.type}
                        </span>
                        {item.incomingMessage && (
                            <p className="mt-3 text-base font-normal leading-relaxed text-navy-500">
                                상대방: "{item.incomingMessage}"
                            </p>
                        )}
                        {!shouldShowOptions && (
                            <p className="mt-3 text-lg font-medium text-navy-900 leading-relaxed">
                                "{item.excuseText}"
                            </p>
                        )}

                        {shouldShowOptions && (
                            <div className="mt-5">
                                <p className="text-base font-bold text-navy-700">
                                    답장 후보{" "}
                                    <span className="text-sm font-normal text-navy-500">
                                        · 마음에 드는 답장을 선택하거나 복사하세요
                                    </span>
                                </p>
                                <div className="mt-3 space-y-3">
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
                                                    "w-full flex items-start gap-3 rounded-md border p-4 sm:p-5 text-left text-base cursor-pointer transition-colors",
                                                    isSelected
                                                        ? "border-brand-primary bg-brand-primary-soft"
                                                        : "border-border-soft bg-white hover:border-[#bedafd]",
                                                ].join(" ")}
                                                aria-pressed={isSelected}
                                            >
                                                <span
                                                    className={[
                                                        "mt-0.5 w-5 h-5 rounded-full border shrink-0 flex items-center justify-center",
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
                                                        "flex-1 min-w-0",
                                                        isSelected
                                                            ? "font-medium text-navy-950"
                                                            : "font-normal text-navy-700",
                                                    ].join(" ")}
                                                >
                                                    <span className="block">"{option}"</span>
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
                <div className="mt-7">
                    <button
                        type="button"
                        onClick={() => setIsFormOpen(true)}
                        className="px-6 py-3 text-base font-bold text-white bg-brand-primary rounded-md shadow-[0_4px_10px_rgba(21,126,251,0.18)] hover:bg-brand-primary-hover hover:shadow-[0_5px_12px_rgba(21,126,251,0.22)] transition-all"
                    >
                        답장 준비하기
                    </button>
                </div>
            )}

            {isFormOpen && (
                <form onSubmit={handleReplySubmit} className="mt-7 border-t border-border-soft pt-7">
                    <div className="flex flex-col gap-3">
                        <label
                            htmlFor={`incoming-message-${excuse.id}`}
                            className="text-base font-bold text-navy-700"
                        >
                            상대방이 보낸 답장
                        </label>
                        <textarea
                            ref={textareaRef}
                            id={`incoming-message-${excuse.id}`}
                            maxLength={500}
                            rows={4}
                            placeholder="예: 진짜? 정전 안내 문자 좀 보여줘봐"
                            value={incomingMessage}
                            onChange={(event) => {
                                setIncomingMessage(event.target.value);
                                setReplyError("");
                            }}
                            className="w-full rounded-md border border-border-input px-4 py-3 text-base text-navy-900 placeholder:text-[#a3b2c7] focus:outline-none focus:border-brand-primary transition resize-none"
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
                                    className="px-5 py-2.5 text-base font-medium text-navy-950 border border-border-input rounded-md hover:bg-brand-primary-soft transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 text-base font-bold text-white bg-brand-primary rounded-md shadow-[0_4px_10px_rgba(21,126,251,0.18)] hover:bg-brand-primary-hover transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
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

            {hasComplexityWarning && !isWarningModalOpen && (
                <button
                    type="button"
                    onClick={() => setIsWarningModalOpen(true)}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-danger-text hover:text-[#c8342f] transition-colors"
                >
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M10.3 3.6 2.4 17.2A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.8L13.7 3.6a2 2 0 0 0-3.4 0Z" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                    </svg>
                    대화 충돌 경고 다시 보기
                </button>
            )}

            {isRoundLimitReached && (
                <p className="mt-4 text-sm font-normal text-navy-300">
                    최대 5라운드까지 진행했어요. 더 이상 답장을 준비할 수
                    없습니다.
                </p>
            )}

            <ComplexityWarningModal
                isOpen={hasComplexityWarning && isWarningModalOpen}
                onClose={() => setIsWarningModalOpen(false)}
                title="이전 답변을 확인해 주세요"
                message={getComplexityWarningMessage(
                    excuse?.complexityWarning?.message
                )}
            />
        </section>
    );
}

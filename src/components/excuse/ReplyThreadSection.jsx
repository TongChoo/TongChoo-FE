import { useEffect, useRef, useState } from "react";
import { excuseApi } from "../../api/excuseApi";
import ComplexityWarningNotice from "../common/ComplexityWarningNotice";
import CopyTextButton from "./CopyTextButton";
import { getComplexityWarningMessage } from "../../utils/complexityWarning";
import {
    excuseTextWrappingClass,
    getExcuseTextSizeClass,
} from "../../utils/excuseTypography";

const MAX_ROUND = 5;

function buildInitialThread(excuse) {
    if (!excuse) return [];

    const savedThread = Array.isArray(excuse.thread) ? excuse.thread : [];

    if (savedThread.length > 0) {
        return savedThread.map((item, index) => {
            const isLatest = index === savedThread.length - 1;
            const typeLabels = {
                ORIGINAL: "원본",
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
                selectedOptionIndex:
                    isLatest && item.type === "REPLY"
                        ? excuse.selectedOptionIndex ?? 0
                        : 0,
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
            selectedOptionIndex: excuse.selectedOptionIndex ?? 0,
        },
    ];
}

function normalizeReplyOptions(excuse) {
    const savedOptions = Array.isArray(excuse?.replyOptions)
        ? excuse.replyOptions
        : [];
    const candidates = savedOptions.length > 0
        ? savedOptions
        : [excuse?.excuse];

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

export default function ReplyThreadSection({
    excuse,
    onReplySuccess,
    onSelectionSuccess,
}) {
    const [thread, setThread] = useState(() => buildInitialThread(excuse));
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [incomingMessage, setIncomingMessage] = useState("");
    const [replyError, setReplyError] = useState("");
    const [isServerRoundLimitReached, setIsServerRoundLimitReached] =
        useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingSelection, setIsSavingSelection] = useState(false);
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
            if (
                error.status === 409 &&
                error.message?.includes("최대 5라운드")
            ) {
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

    async function handleSelectReplyOption(threadIndex, optionIndex) {
        const item = thread[threadIndex];
        const selectedExcuse = item?.replyOptions?.[optionIndex];
        if (
            !item ||
            !selectedExcuse ||
            optionIndex === item.selectedOptionIndex ||
            isSavingSelection
        ) {
            return;
        }

        const previousOptionIndex = item.selectedOptionIndex;
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

        try {
            setIsSavingSelection(true);
            setReplyError("");
            const saved = await excuseApi.selectReplyOption({
                excuseId: item.id,
                selectedExcuse,
            });
            onSelectionSuccess?.({
                ...saved,
                situation: saved.situation ?? excuse.situation,
            });
        } catch (error) {
            setThread((prev) =>
                prev.map((threadItem, index) =>
                    index === threadIndex
                        ? {
                            ...threadItem,
                            selectedOptionIndex: previousOptionIndex,
                            excuseText:
                                threadItem.replyOptions?.[previousOptionIndex] ??
                                threadItem.excuseText,
                        }
                        : threadItem
                )
            );
            setReplyError(
                error.message || "선택한 답장을 저장하지 못했습니다."
            );
        } finally {
            setIsSavingSelection(false);
        }
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
                            <p className={`mt-3 font-medium text-navy-900 leading-relaxed ${excuseTextWrappingClass} ${getExcuseTextSizeClass(item.excuseText, "compact")}`}>
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
                                                className={[
                                                    "w-full flex items-start gap-3 rounded-md border p-4 sm:p-5 text-left text-base cursor-pointer transition-colors",
                                                    isSelected
                                                        ? "border-brand-primary bg-brand-primary-soft"
                                                        : "border-border-soft bg-white hover:border-[#bedafd]",
                                                ].join(" ")}
                                            >
                                                <label
                                                    className="flex flex-1 min-w-0 items-start gap-3 cursor-pointer"
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`reply-option-${item.id}`}
                                                        value={option}
                                                        checked={isSelected}
                                                        disabled={isSavingSelection}
                                                        onChange={() =>
                                                            handleSelectReplyOption(
                                                                threadIndex,
                                                                optionIndex
                                                            )
                                                        }
                                                        className="sr-only"
                                                    />
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
                                                        <span className={`block leading-relaxed ${excuseTextWrappingClass} ${getExcuseTextSizeClass(option, "compact")}`}>
                                                            "{option}"
                                                        </span>
                                                    </span>
                                                </label>
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

            {hasComplexityWarning && (
                <ComplexityWarningNotice
                    className="mt-5"
                    message={getComplexityWarningMessage(
                        excuse?.complexityWarning?.message
                    )}
                />
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

import { useState } from "react";

export default function CopyTextButton({
    text,
    label = "복사하기",
    copiedLabel = "복사됨",
    className = "px-4 py-2 text-sm font-bold text-brand-primary border border-border-input rounded-md hover:bg-brand-primary-soft transition-colors",
    iconOnly = false,
}) {
    const [isCopied, setIsCopied] = useState(false);

    async function handleCopy(event) {
        event.stopPropagation();

        if (!text) return;

        try {
            if (!navigator.clipboard) return;

            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            window.setTimeout(() => setIsCopied(false), 1400);
        } catch {
            setIsCopied(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            className={className}
            aria-label={iconOnly ? label : undefined}
        >
            {isCopied ? (
                <span className={iconOnly ? "sr-only" : undefined}>{copiedLabel}</span>
            ) : (
                <span className={iconOnly ? "sr-only" : undefined}>{label}</span>
            )}
            {iconOnly && (
                <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    {isCopied ? (
                        <path d="M5 13l4 4L19 7" />
                    ) : (
                        <>
                            <rect x="9" y="9" width="11" height="11" rx="2" />
                            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                        </>
                    )}
                </svg>
            )}
        </button>
    );
}

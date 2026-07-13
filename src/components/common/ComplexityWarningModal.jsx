import { useEffect } from "react";

export default function ComplexityWarningModal({
    isOpen,
    onClose,
    title = "이전 내용을 확인해 주세요",
    message,
}) {
    useEffect(() => {
        if (!isOpen) return undefined;

        function handleEscape(event) {
            if (event.key === "Escape") onClose();
        }

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen || !message) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/45 px-5"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="complexity-warning-title"
                aria-describedby="complexity-warning-description"
                className="w-full max-w-lg rounded-lg border border-border-soft bg-white p-7 shadow-[0_8px_24px_rgba(11,42,85,0.14)] sm:p-9"
            >
                <div className="flex items-start gap-4">
                    <svg
                        viewBox="0 0 24 24"
                        className="mt-0.5 h-7 w-7 shrink-0 text-danger-text"
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

                    <div className="min-w-0">
                        <h2
                            id="complexity-warning-title"
                            className="text-2xl font-bold text-navy-950"
                        >
                            {title}
                        </h2>
                        <p
                            id="complexity-warning-description"
                            className="mt-3 text-base font-normal leading-relaxed text-navy-500"
                        >
                            {message}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    autoFocus
                    onClick={onClose}
                    className="mt-7 w-full rounded-md bg-brand-primary px-6 py-3 text-base font-bold text-white shadow-[0_4px_10px_rgba(21,126,251,0.18)] hover:bg-brand-primary-hover hover:shadow-[0_5px_12px_rgba(21,126,251,0.22)] transition-all"
                >
                    확인하고 계속하기
                </button>
            </div>
        </div>
    );
}

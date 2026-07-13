export default function ComplexityWarningNotice({ message, className = "" }) {
    if (!message) return null;

    return (
        <p
            role="status"
            className={`flex items-start gap-2 text-sm font-medium text-danger-text ${className}`}
        >
            <svg
                viewBox="0 0 24 24"
                className="mt-0.5 h-4 w-4 shrink-0"
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
            <span>{message}</span>
        </p>
    );
}

import { useState } from "react";
import type { EditSuggestion } from "~/lib/storage";

interface Props {
    edits: EditSuggestion[];
}

const CopyIcon = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

const CheckIcon = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const SuggestionCard = ({ edit }: { edit: EditSuggestion }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(edit.suggested);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch (e) {
            console.error("Clipboard write failed:", e);
        }
    };

    return (
        <div
            style={{
                background: "var(--color-card-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
            }}
        >
            {/* Section + reason header */}
            <div className="flex items-center justify-between flex-wrap" style={{ gap: 8 }}>
                <span
                    className="font-medium"
                    style={{
                        fontSize: "var(--text-tiny)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--color-brand-400)",
                    }}
                >
                    {edit.section}
                </span>
                {edit.reason && (
                    <span
                        style={{
                            fontSize: "var(--text-tiny)",
                            color: "var(--color-text-tertiary)",
                            fontStyle: "italic",
                        }}
                    >
                        {edit.reason}
                    </span>
                )}
            </div>

            {/* Original (struck through, danger tint) */}
            <div
                style={{
                    background: "var(--color-danger-soft)",
                    border: "1px solid var(--color-danger-border)",
                    borderRadius: 8,
                    padding: "10px 12px",
                }}
            >
                <div
                    className="font-medium"
                    style={{
                        fontSize: "var(--text-tiny)",
                        color: "var(--color-danger-text)",
                        marginBottom: 4,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                    }}
                >
                    Original
                </div>
                <p
                    style={{
                        fontSize: "var(--text-small)",
                        lineHeight: 1.5,
                        color: "var(--color-text-secondary)",
                        textDecoration: "line-through",
                        textDecorationColor: "rgba(248, 113, 113, 0.5)",
                    }}
                >
                    {edit.original}
                </p>
            </div>

            {/* Suggested (success tint, with copy button) */}
            <div
                style={{
                    background: "var(--color-success-soft)",
                    border: "1px solid var(--color-success-border)",
                    borderRadius: 8,
                    padding: "10px 12px",
                }}
            >
                <div
                    className="flex items-center justify-between"
                    style={{ marginBottom: 4 }}
                >
                    <div
                        className="font-medium"
                        style={{
                            fontSize: "var(--text-tiny)",
                            color: "var(--color-success-text)",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                        }}
                    >
                        Suggested
                    </div>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="btn-icon"
                        style={{ width: 28, height: 28 }}
                        aria-label="Copy suggested text"
                        title={copied ? "Copied!" : "Copy"}
                    >
                        {copied ? <CheckIcon /> : <CopyIcon />}
                    </button>
                </div>
                <p
                    style={{
                        fontSize: "var(--text-small)",
                        lineHeight: 1.5,
                        color: "var(--color-text-primary)",
                    }}
                >
                    {edit.suggested}
                </p>
            </div>
        </div>
    );
};

const EditSuggestions = ({ edits }: Props) => {
    if (!edits || edits.length === 0) {
        return (
            <div className="card">
                <div className="flex flex-col" style={{ gap: 4, marginBottom: 12 }}>
                    <span className="eyebrow">Suggested Edits</span>
                    <h2>Rewrite suggestions</h2>
                </div>
                <p style={{ fontSize: "var(--text-small)" }}>
                    No rewrite suggestions were generated for this resume. Try re-uploading with a
                    more specific job description.
                </p>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="flex flex-col" style={{ gap: 4, marginBottom: 16 }}>
                <span className="eyebrow">Suggested Edits</span>
                <h2>{edits.length} rewrite suggestion{edits.length === 1 ? "" : "s"}</h2>
                <p style={{ fontSize: "var(--text-small)", marginTop: 2 }}>
                    Copy any suggested rewrite and paste it into your resume editor. We never modify
                    your original PDF.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 12 }}>
                {edits.map((edit, i) => (
                    <SuggestionCard key={i} edit={edit} />
                ))}
            </div>
        </div>
    );
};

export default EditSuggestions;

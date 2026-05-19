import React from "react";
import ScoreCircle from "~/components/ScoreCircle";

interface Suggestion {
    type: "good" | "improve";
    tip: string;
}

interface ATSProps {
    score: number;
    suggestions: Suggestion[];
}

const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const WarnIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
    const subtitle = score >= 70 ? "Great job!" : score >= 50 ? "Good start" : "Needs work";
    const blurb =
        score >= 70
            ? "Your resume is well-optimized for ATS systems used by most employers."
            : score >= 50
            ? "Your resume passes basic ATS checks but has room for improvement."
            : "Your resume may struggle with ATS systems — review the tips below.";

    return (
        <div className="card">
            <div className="flex items-center" style={{ gap: 16, marginBottom: 12 }}>
                <ScoreCircle score={score} variant="sm" />
                <div className="flex flex-col">
                    <span className="eyebrow">ATS Score</span>
                    <h2 style={{ marginTop: 2 }}>{subtitle}</h2>
                </div>
            </div>

            <p style={{ fontSize: "var(--text-small)", marginBottom: 16 }}>{blurb}</p>

            <div className="flex flex-col" style={{ gap: 8 }}>
                {suggestions.map((s, i) => (
                    <div
                        key={i}
                        className="flex items-start"
                        style={{
                            gap: 10,
                            padding: "10px 12px",
                            borderRadius: 8,
                            background:
                                s.type === "good"
                                    ? "var(--color-success-soft)"
                                    : "var(--color-warning-soft)",
                        }}
                    >
                        <span
                            className="flex-shrink-0"
                            style={{
                                marginTop: 2,
                                color:
                                    s.type === "good"
                                        ? "var(--color-success)"
                                        : "var(--color-warning)",
                            }}
                        >
                            {s.type === "good" ? <CheckIcon /> : <WarnIcon />}
                        </span>
                        <p
                            style={{
                                fontSize: "var(--text-small)",
                                lineHeight: 1.5,
                                color:
                                    s.type === "good"
                                        ? "var(--color-badge-green-text)"
                                        : "var(--color-badge-yellow-text)",
                            }}
                        >
                            {s.tip}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ATS;

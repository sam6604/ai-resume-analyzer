<<<<<<< Updated upstream
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
=======
import React from 'react'

interface Suggestion {
  type: "good" | "improve";
  tip: string;
}

interface ATSProps {
  score: number;
  suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  const isGood = score > 69;
  const isWarning = score > 49;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`size-12 rounded-2xl flex items-center justify-center ${
            isGood ? 'bg-green-100' : isWarning ? 'bg-amber-100' : 'bg-red-100'
          }`}>
            <img 
              src={isGood ? '/icons/ats-good.svg' : isWarning ? '/icons/ats-warning.svg' : '/icons/ats-bad.svg'} 
              alt="ATS" 
              className="size-8" 
            />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">ATS Compatibility</h3>
            <p className="text-slate-500 font-medium">Optimization for automated systems</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-xl font-bold text-xl ${
          isGood ? 'bg-green-50 text-green-700' : isWarning ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
        }`}>
          {score}%
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((suggestion, index) => (
          <div 
            key={index} 
            className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 hover:shadow-md ${
              suggestion.type === "good" 
              ? "bg-green-50/30 border-green-100/50 hover:bg-green-50" 
              : "bg-amber-50/30 border-amber-100/50 hover:bg-amber-50"
            }`}
          >
            <div className={`mt-1 size-6 rounded-full flex items-center justify-center shrink-0 ${
              suggestion.type === "good" ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
            }`}>
              <img
                src={suggestion.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                alt="status"
                className="size-4"
              />
            </div>
            <p className={`font-semibold leading-snug ${suggestion.type === "good" ? "text-green-800" : "text-amber-800"}`}>
              {suggestion.tip}
            </p>
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
        <p className="text-sm text-slate-600 font-medium italic text-center">
          "A high ATS score increases your visibility to recruiters by ensuring your data is parsed accurately."
        </p>
      </div>
    </div>
  )
}

export default ATS
>>>>>>> Stashed changes

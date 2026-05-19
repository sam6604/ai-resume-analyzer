<<<<<<< Updated upstream
interface ScoreBadgeProps {
    score: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
    let cls = "";
    let label = "";
    if (score >= 70) {
        cls = "bg-success-soft text-[var(--color-success)]";
        label = "Strong";
    } else if (score >= 50) {
        cls = "bg-warning-soft text-[var(--color-warning)]";
        label = "Good Start";
    } else {
        cls = "bg-danger-soft text-[var(--color-danger)]";
        label = "Needs Work";
    }
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${cls}`}
            style={{ fontSize: "var(--text-tiny)" }}
        >
            {label}
        </span>
    );
=======
import React from 'react';
import { cn } from "~/lib/utils";

interface ScoreBadgeProps {
  score: number;
  className?: string;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, className }) => {
  const isGood = score > 69;
  const isWarning = score > 49;

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-widest border transition-all duration-300",
      isGood 
        ? "bg-green-50 text-green-700 border-green-100" 
        : isWarning 
          ? "bg-amber-50 text-amber-700 border-amber-100" 
          : "bg-red-50 text-red-700 border-red-100",
      className
    )}>
      <div className={cn(
        "size-2 rounded-full",
        isGood ? "bg-green-500 animate-pulse" : isWarning ? "bg-amber-500" : "bg-red-500"
      )} />
      {score}%
    </div>
  );
>>>>>>> Stashed changes
};

export default ScoreBadge;

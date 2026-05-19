<<<<<<< Updated upstream
import { useEffect, useState } from "react";

export type ScoreVariant = "sm" | "md" | "lg";

interface ScoreCircleProps {
    score?: number;
    variant?: ScoreVariant;
}

const SIZES: Record<ScoreVariant, { box: number; stroke: number; font: number }> = {
    sm: { box: 60, stroke: 6, font: 16 },
    md: { box: 120, stroke: 6, font: 28 },
    lg: { box: 160, stroke: 8, font: 32 },
};

const colorFor = (score: number) => {
    if (score >= 70) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
};

const ScoreCircle = ({ score = 0, variant = "md" }: ScoreCircleProps) => {
    const { box, stroke, font } = SIZES[variant];
    const radius = (box - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const target = Math.max(0, Math.min(100, score));
    const [animated, setAnimated] = useState(0);

    useEffect(() => {
        let raf = 0;
        const startedAt = performance.now();
        const duration = 800;
        const ease = (t: number) => 1 - Math.pow(1 - t, 3);
        const step = (t: number) => {
            const p = Math.min(1, (t - startedAt) / duration);
            setAnimated(Math.round(target * ease(p)));
            if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [target]);

    const offset = circumference * (1 - animated / 100);

    return (
        <div className="relative" style={{ width: box, height: box }}>
            <svg width={box} height={box} className="-rotate-90" aria-hidden="true">
                <circle
                    cx={box / 2}
                    cy={box / 2}
                    r={radius}
                    stroke="var(--color-border)"
                    strokeWidth={stroke}
                    fill="transparent"
                />
                <circle
                    cx={box / 2}
                    cy={box / 2}
                    r={radius}
                    stroke={colorFor(target)}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 800ms ease-out" }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span
                    className="font-semibold num text-text-primary"
                    style={{ fontSize: font }}
                >
                    {animated}
                </span>
=======
const ScoreCircle = ({ score = 75 }: { score: number }) => {
    const radius = 40;
    const stroke = 6;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const progress = score / 100;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="relative w-20 h-20 group">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <svg
                height="100%"
                width="100%"
                viewBox="0 0 100 100"
                className="transform -rotate-90 relative z-10"
            >
                {/* Background circle */}
                <circle
                    cx="50"
                    cy="50"
                    r={normalizedRadius}
                    stroke="#f1f5f9"
                    strokeWidth={stroke}
                    fill="transparent"
                />
                {/* Partial circle with gradient */}
                <defs>
                    <linearGradient id="circle-grad" x1="1" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                </defs>
                <circle
                    cx="50"
                    cy="50"
                    r={normalizedRadius}
                    stroke="url(#circle-grad)"
                    strokeWidth={stroke}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>

            {/* Score */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <span className="font-extrabold text-lg text-slate-900 leading-none">{score}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Score</span>
>>>>>>> Stashed changes
            </div>
        </div>
    );
};

export default ScoreCircle;

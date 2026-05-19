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
            </div>
        </div>
    );
};

export default ScoreCircle;

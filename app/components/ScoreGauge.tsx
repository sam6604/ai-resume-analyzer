import { useEffect, useRef, useState } from "react";
<<<<<<< Updated upstream
import type { ScoreVariant } from "./ScoreCircle";

interface ScoreGaugeProps {
    score?: number;
    variant?: ScoreVariant;
}

const SIZES: Record<ScoreVariant, { w: number; h: number; stroke: number; num: number }> = {
    sm: { w: 100, h: 56, stroke: 6, num: 16 },
    md: { w: 160, h: 88, stroke: 6, num: 28 },
    lg: { w: 200, h: 110, stroke: 8, num: 32 },
};

const colorFor = (score: number) => {
    if (score >= 70) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
};

const ScoreGauge = ({ score = 0, variant = "md" }: ScoreGaugeProps) => {
    const target = Math.max(0, Math.min(100, score));
    const { w, h, stroke, num } = SIZES[variant];
    const pathRef = useRef<SVGPathElement>(null);
    const [pathLength, setPathLength] = useState(0);
    const [animated, setAnimated] = useState(0);

    useEffect(() => {
        if (pathRef.current) setPathLength(pathRef.current.getTotalLength());
    }, []);

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

    const color = colorFor(target);
    const offset = pathLength * (1 - animated / 100);

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: w, height: h }}>
                <svg viewBox="0 0 100 55" className="w-full h-full" aria-hidden="true">
                    <path
                        d="M10,50 A40,40 0 0,1 90,50"
                        fill="none"
                        stroke="var(--color-border)"
                        strokeWidth={stroke}
                        strokeLinecap="round"
                    />
=======

const ScoreGauge = ({ score = 75 }: { score: number }) => {
    const [pathLength, setPathLength] = useState(0);
    const pathRef = useRef<SVGPathElement>(null);

    const percentage = score / 100;

    useEffect(() => {
        if (pathRef.current) {
            setPathLength(pathRef.current.getTotalLength());
        }
    }, []);

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-48 h-24 group">
                {/* Glow */}
                <div className="absolute inset-x-0 bottom-0 h-12 bg-indigo-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <svg viewBox="0 0 100 50" className="w-full h-full relative z-10">
                    <defs>
                        <linearGradient
                            id="gauge-premium-grad"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop offset="0%" stopColor="#818cf8" />
                            <stop offset="100%" stopColor="#4f46e5" />
                        </linearGradient>
                    </defs>

                    {/* Background arc */}
                    <path
                        d="M10,50 A40,40 0 0,1 90,50"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />

                    {/* Foreground arc */}
>>>>>>> Stashed changes
                    <path
                        ref={pathRef}
                        d="M10,50 A40,40 0 0,1 90,50"
                        fill="none"
<<<<<<< Updated upstream
                        stroke={color}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={pathLength}
                        strokeDashoffset={offset}
                        style={{ transition: "stroke-dashoffset 800ms ease-out" }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-end justify-center" style={{ paddingBottom: 2 }}>
                    <span
                        className="font-semibold num leading-none text-text-primary"
                        style={{ fontSize: num }}
                    >
                        {animated}
                        <span
                            className="font-normal text-text-tertiary"
                            style={{ fontSize: Math.round(num * 0.5) }}
                        >
                            {" /100"}
                        </span>
                    </span>
=======
                        stroke="url(#gauge-premium-grad)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={pathLength}
                        strokeDashoffset={pathLength * (1 - percentage)}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 z-10">
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-black text-slate-900 leading-none">{score}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Overall</span>
                    </div>
>>>>>>> Stashed changes
                </div>
            </div>
        </div>
    );
};

export default ScoreGauge;

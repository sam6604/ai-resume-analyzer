<<<<<<< Updated upstream
import ScoreCircle from "~/components/ScoreCircle";

const CategoryTile = ({ title, score }: { title: string; score: number }) => {
    return (
        <div
            className="flex flex-col items-center bg-white"
            style={{
                gap: 8,
                padding: "16px 12px",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
            }}
        >
            <ScoreCircle score={score} variant="sm" />
            <p
                className="text-text-primary font-medium text-center"
                style={{ fontSize: "var(--text-small)" }}
            >
                {title}
            </p>
        </div>
    );
};

const Summary = ({ feedback }: { feedback: Feedback }) => {
    return (
        <div className="card">
            <div className="flex flex-col sm:flex-row items-center sm:items-start" style={{ gap: 24 }}>
                <div className="flex-shrink-0">
                    <ScoreCircle score={feedback.overallScore} variant="md" />
                </div>
                <div className="flex flex-col" style={{ gap: 4 }}>
                    <h2>Your resume score</h2>
                    <p style={{ fontSize: "var(--text-small)" }}>
                        Overall quality across tone, content, structure, and skills.
                        Scroll for category-level tips and explanations.
                    </p>
                </div>
            </div>
            <div
                className="grid grid-cols-2 xl:grid-cols-4"
                style={{ gap: 12, marginTop: 20 }}
            >
                <CategoryTile title="Tone & Style" score={feedback.toneAndStyle.score} />
                <CategoryTile title="Content" score={feedback.content.score} />
                <CategoryTile title="Structure" score={feedback.structure.score} />
                <CategoryTile title="Skills" score={feedback.skills.score} />
            </div>
        </div>
    );
};

export default Summary;
=======
import ScoreGauge from "~/components/ScoreGauge";
import ScoreBadge from "~/components/ScoreBadge";

const Category = ({ title, score }: { title: string, score: number }) => {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md hover:border-indigo-100 group">
            <span className="text-lg font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{title}</span>
            <div className="flex items-center gap-3">
                <div className="h-1.5 w-24 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                    <div 
                        className="h-full bg-indigo-600 transition-all duration-1000" 
                        style={{ width: `${score}%` }}
                    />
                </div>
                <ScoreBadge score={score} />
            </div>
        </div>
    )
}

const Summary = ({ feedback }: { feedback: Feedback }) => {
    return (
        <div className="glass-card p-8 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                    <div className="absolute -inset-4 bg-indigo-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <ScoreGauge score={feedback.overallScore} />
                </div>

                <div className="flex flex-col gap-2 text-center md:text-left">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Executive Summary</h2>
                    <p className="text-slate-500 font-medium">
                        Your overall match for the position. We've analyzed tone, content, structure, and technical skills.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
                <Category title="Content" score={feedback.content.score} />
                <Category title="Structure" score={feedback.structure.score} />
                <Category title="Skills" score={feedback.skills.score} />
            </div>
        </div>
    )
}
export default Summary
>>>>>>> Stashed changes

import ScoreCircle from "~/components/ScoreCircle";

const CategoryTile = ({ title, score }: { title: string; score: number }) => {
    return (
        <div
            className="flex flex-col items-center"
            style={{
                gap: 8,
                padding: "16px 12px",
                background: "var(--color-card-bg-elevated)",
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
                className="grid grid-cols-2"
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

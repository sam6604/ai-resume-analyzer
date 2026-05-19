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
};

export default ScoreBadge;

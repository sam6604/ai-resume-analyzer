import { cn } from "~/lib/utils";
import {
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionItem,
} from "./Accordion";

const ScoreBadge = ({ score }: { score: number }) => (
    <span
        className={cn(
            "inline-flex items-center rounded-full font-medium num",
            score >= 70
                ? "bg-success-soft text-[var(--color-success)]"
                : score >= 50
                ? "bg-warning-soft text-[var(--color-warning)]"
                : "bg-danger-soft text-[var(--color-danger)]"
        )}
        style={{ fontSize: "var(--text-tiny)", padding: "2px 8px" }}
    >
        {score}/100
    </span>
);

const CategoryHeader = ({ title, categoryScore }: { title: string; categoryScore: number }) => (
    <div className="flex items-center" style={{ gap: 10 }}>
        <span className="font-semibold text-text-primary" style={{ fontSize: "var(--text-body)" }}>
            {title}
        </span>
        <ScoreBadge score={categoryScore} />
    </div>
);

const CategoryContent = ({
    tips,
}: {
    tips: { type: "good" | "improve"; tip: string; explanation: string }[];
}) => (
    <div className="flex flex-col" style={{ gap: 10 }}>
        {tips.map((tip, i) => (
            <div
                key={i}
                style={{
                    padding: 14,
                    borderRadius: 10,
                    background:
                        tip.type === "good" ? "var(--color-success-soft)" : "var(--color-warning-soft)",
                    border:
                        tip.type === "good" ? "1px solid #bbf7d0" : "1px solid #fde68a",
                }}
            >
                <div className="flex items-start" style={{ gap: 8, marginBottom: 4 }}>
                    <span
                        className="flex-shrink-0"
                        style={{
                            marginTop: 2,
                            color:
                                tip.type === "good"
                                    ? "var(--color-success)"
                                    : "var(--color-warning)",
                        }}
                    >
                        {tip.type === "good" ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        )}
                    </span>
                    <p
                        className="font-semibold"
                        style={{
                            fontSize: "var(--text-small)",
                            lineHeight: 1.5,
                            color:
                                tip.type === "good"
                                    ? "var(--color-badge-green-text)"
                                    : "var(--color-badge-yellow-text)",
                        }}
                    >
                        {tip.tip}
                    </p>
                </div>
                <p
                    style={{
                        fontSize: "var(--text-small)",
                        lineHeight: 1.5,
                        color: "var(--color-text-secondary)",
                        paddingLeft: 22,
                    }}
                >
                    {tip.explanation}
                </p>
            </div>
        ))}
    </div>
);

const Details = ({ feedback }: { feedback: Feedback }) => {
    return (
        <div className="flex flex-col w-full" style={{ gap: 12 }}>
            <div className="flex flex-col" style={{ gap: 2 }}>
                <span className="eyebrow">Detailed Report</span>
                <h2>Category breakdown</h2>
                <p style={{ fontSize: "var(--text-small)", marginTop: 2 }}>
                    Tap any category to see specific tips and explanations.
                </p>
            </div>
            <Accordion defaultOpen="tone-style">
                <AccordionItem id="tone-style">
                    <AccordionHeader itemId="tone-style">
                        <CategoryHeader title="Tone & Style" categoryScore={feedback.toneAndStyle.score} />
                    </AccordionHeader>
                    <AccordionContent itemId="tone-style">
                        <CategoryContent tips={feedback.toneAndStyle.tips} />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem id="content">
                    <AccordionHeader itemId="content">
                        <CategoryHeader title="Content" categoryScore={feedback.content.score} />
                    </AccordionHeader>
                    <AccordionContent itemId="content">
                        <CategoryContent tips={feedback.content.tips} />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem id="structure">
                    <AccordionHeader itemId="structure">
                        <CategoryHeader title="Structure" categoryScore={feedback.structure.score} />
                    </AccordionHeader>
                    <AccordionContent itemId="structure">
                        <CategoryContent tips={feedback.structure.tips} />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem id="skills">
                    <AccordionHeader itemId="skills">
                        <CategoryHeader title="Skills" categoryScore={feedback.skills.score} />
                    </AccordionHeader>
                    <AccordionContent itemId="skills">
                        <CategoryContent tips={feedback.skills.tips} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default Details;

import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import type { StoredResume } from "~/lib/storage";

const formatDate = (ts: number): string => {
    try {
        return new Date(ts).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return "";
    }
};

const ResumeCard = ({ resume }: { resume: StoredResume }) => {
    return (
        <Link
            to={`/resume/${resume.id}`}
            className="card card-hover flex flex-col group"
            style={{ gap: 16, padding: 20 }}
        >
            <div className="flex items-start justify-between" style={{ gap: 16 }}>
                <div className="flex flex-col min-w-0 flex-1" style={{ gap: 4 }}>
                    <h3 className="truncate">{resume.companyName || "Untitled resume"}</h3>
                    {resume.jobTitle && (
                        <p className="text-text-secondary truncate" style={{ fontSize: "var(--text-small)" }}>
                            {resume.jobTitle}
                        </p>
                    )}
                    <p
                        className="text-text-tertiary"
                        style={{ fontSize: "var(--text-tiny)", marginTop: 4 }}
                    >
                        {formatDate(resume.createdAt)}
                    </p>
                </div>
                <ScoreCircle score={resume.feedback.overallScore} variant="sm" />
            </div>
            <div
                className="flex items-center justify-between"
                style={{
                    paddingTop: 12,
                    borderTop: "1px solid var(--color-border)",
                    fontSize: "var(--text-small)",
                    color: "var(--color-text-secondary)",
                }}
            >
                <span>ATS · <span className="num font-medium text-text-primary">{resume.feedback.ATS.score}/100</span></span>
                <span className="text-brand-600 font-medium group-hover:underline">View report →</span>
            </div>
        </Link>
    );
};

export default ResumeCard;

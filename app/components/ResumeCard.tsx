<<<<<<< Updated upstream
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
=======
import {Link} from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }: { resume: Resume }) => {
    const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');

    useEffect(() => {
        const loadResume = async () => {
            const blob = await fs.read(imagePath);
            if(!blob) return;
            let url = URL.createObjectURL(blob);
            setResumeUrl(url);
        }

        loadResume();
    }, [imagePath]);

    return (
        <Link to={`/resume/${id}`} className="resume-card group">
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-1 min-w-0 pr-4">
                        <h2 className="text-xl font-bold text-slate-900 truncate">
                            {companyName || "Resume Review"}
                        </h2>
                        <h3 className="text-sm font-medium text-slate-500 truncate">
                            {jobTitle || "General Analysis"}
                        </h3>
                    </div>
                    <div className="scale-75 origin-top-right">
                        <ScoreCircle score={feedback.overallScore} />
                    </div>
                </div>

                <div className="relative flex-1 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 transition-transform duration-500 group-hover:scale-[1.02]">
                    {resumeUrl ? (
                        <img
                            src={resumeUrl}
                            alt="resume"
                            className="w-full h-full object-cover object-top transition-opacity duration-500 group-hover:opacity-90"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="size-12 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                        </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors duration-500 flex items-center justify-center">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-xl translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                           <span className="text-sm font-bold text-indigo-600">View Details</span>
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <span>AI Scored</span>
                    <span className="text-indigo-600">Analysis Ready</span>
                </div>
            </div>
        </Link>
    )
}
export default ResumeCard
>>>>>>> Stashed changes

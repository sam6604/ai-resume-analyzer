import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import EditSuggestions from "~/components/EditSuggestions";
import JobRecommendations from "~/components/JobRecommendations";
import { getResume, type StoredResume } from "~/lib/storage";

export const meta = () => [
    { title: "Resumind | Review" },
    { name: "description", content: "Detailed overview of your resume" },
];

const Resume = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resume, setResume] = useState<StoredResume | null>(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!id) return;
        const r = getResume(id);
        if (!r) {
            setNotFound(true);
            return;
        }
        setResume(r);
    }, [id]);

    if (notFound) {
        return (
            <main>
                <nav className="resume-nav">
                    <div className="container-app w-full flex items-center justify-between">
                        <div className="breadcrumb">
                            <Link to="/">Home</Link>
                            <span>/</span>
                            <span className="text-text-primary font-medium">Not found</span>
                        </div>
                    </div>
                </nav>
                <div className="container-app" style={{ paddingTop: 48 }}>
                    <div className="card text-center" style={{ padding: 48 }}>
                        <h2>Analysis not found</h2>
                        <p className="mt-2" style={{ fontSize: "var(--text-small)" }}>
                            This analysis isn't in your local storage. It may have been wiped, or
                            you're viewing it from a different browser.
                        </p>
                        <button className="btn-primary mt-4" onClick={() => navigate("/upload")}>
                            Analyze a new resume
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    const feedback = resume?.feedback ?? null;

    return (
        <main>
            <nav className="resume-nav">
                <div className="container-app w-full flex items-center justify-between">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link>
                        <span>/</span>
                        <span className="text-text-primary font-medium">
                            {resume?.companyName || resume?.jobTitle || "Analysis"}
                        </span>
                    </div>
                    <Link to="/upload" className="btn-secondary btn-sm">
                        New analysis
                    </Link>
                </div>
            </nav>

            <div className="container-app" style={{ paddingTop: 32, paddingBottom: 48 }}>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{ marginBottom: 24 }}
                >
                    <span className="eyebrow">Resume Review</span>
                    <h1 style={{ marginTop: 4 }}>
                        {resume?.companyName || "Your resume"}
                        {resume?.jobTitle && (
                            <span className="text-text-tertiary font-normal">
                                {" · "}
                                {resume.jobTitle}
                            </span>
                        )}
                    </h1>
                </motion.div>

                {feedback ? (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex flex-col gap-5"
                    >
                        {/* Row 1 — score overview + ATS, side-by-side on lg+ */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <Summary feedback={feedback} />
                            <ATS
                                score={feedback.ATS.score || 0}
                                suggestions={feedback.ATS.tips || []}
                            />
                        </div>

                        {/* Row 2 — detailed breakdown (full width accordion) */}
                        <Details feedback={feedback} />

                        {/* Row 3 — suggested edits (2-col card grid inside on lg+) */}
                        <EditSuggestions edits={resume?.edits ?? []} />

                        {/* Row 4 — recommended jobs (2-col grid inside on lg+) */}
                        <JobRecommendations
                            skill={resume?.jobTitle || ""}
                            profile={resume?.profile}
                        />
                    </motion.div>
                ) : (
                    <div
                        className="card flex flex-col items-center"
                        style={{ paddingTop: 48, paddingBottom: 48, gap: 12 }}
                    >
                        <div className="flex items-center gap-2 text-text-tertiary">
                            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                            <span style={{ fontSize: "var(--text-small)" }}>Loading analysis…</span>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default Resume;

import { motion } from "framer-motion";
import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { listResumes, type StoredResume } from "~/lib/storage";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Resumind" },
        { name: "description", content: "Smart feedback for your dream job!" },
    ];
}

const EmptyIllustration = () => (
    <svg
        width="120"
        height="96"
        viewBox="0 0 160 120"
        fill="none"
        aria-hidden="true"
        style={{ color: "#818cf8" }}
    >
        <rect x="36" y="14" width="88" height="92" rx="8" stroke="currentColor" strokeWidth="2" fill="#18181b" />
        <line x1="48" y1="34" x2="112" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="48" x2="100" y2="48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="62" x2="112" y2="62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="76" x2="92" y2="76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="124" cy="14" r="14" fill="rgba(99, 102, 241, 0.15)" stroke="currentColor" strokeWidth="2" />
        <path d="M118 14 L122 18 L130 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
);

export default function Home() {
    const [resumes, setResumes] = useState<StoredResume[]>([]);

    useEffect(() => {
        setResumes(listResumes());
    }, []);

    return (
        <main>
            <Navbar />

            <section className="hero-glow" style={{ maxHeight: 360 }}>
                <div className="container-app relative z-10" style={{ paddingTop: 64, paddingBottom: 64 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="page-heading-center"
                    >
                        <span className="eyebrow">AI-Powered Resume Review</span>
                        <h1 className="hero">Analyze your resume in 30 seconds</h1>
                        <p className="max-w-lg" style={{ color: "var(--color-text-secondary)" }}>
                            Instant ATS score and tailored feedback — turn your resume into your strongest application.
                        </p>
                        <Link to="/upload" className="btn-primary mt-1">
                            Upload Resume
                        </Link>
                    </motion.div>
                </div>
            </section>

            <section className="container-app" style={{ paddingTop: 48, paddingBottom: 48 }}>
                <div className="flex flex-row items-end justify-between mb-6">
                    <div>
                        <h2>Your Analyses</h2>
                        {resumes.length > 0 && (
                            <p className="mt-1" style={{ fontSize: "var(--text-small)" }}>
                                Click any analysis to review the full report.
                            </p>
                        )}
                    </div>
                    {resumes.length > 0 && (
                        <Link to="/upload" className="btn-secondary btn-sm">
                            + New
                        </Link>
                    )}
                </div>

                {resumes.length === 0 ? (
                    <div className="card flex flex-col items-center text-center" style={{ gap: 12, paddingTop: 48, paddingBottom: 48 }}>
                        <EmptyIllustration />
                        <div>
                            <h3>No analyses yet</h3>
                            <p className="mt-1" style={{ fontSize: "var(--text-small)" }}>
                                Upload your first resume to get instant AI feedback.
                            </p>
                        </div>
                        <Link to="/upload" className="btn-primary mt-2">
                            Upload Resume
                        </Link>
                    </div>
                ) : (
                    <div className="resumes-section">
                        {resumes.map((resume, idx) => (
                            <motion.div
                                key={resume.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.04, ease: "easeOut" }}
                            >
                                <ResumeCard resume={resume} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

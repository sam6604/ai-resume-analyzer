import { motion } from "framer-motion";
import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
<<<<<<< Updated upstream
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { listResumes, type StoredResume } from "~/lib/storage";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Resumind" },
        { name: "description", content: "Smart feedback for your dream job!" },
    ];
=======
import Intro from "~/components/Intro";
import {usePuterStore} from "~/lib/puter";
import {Link, useNavigate} from "react-router";
import {useEffect, useState} from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
>>>>>>> Stashed changes
}

const EmptyIllustration = () => (
    <svg
        width="120"
        height="96"
        viewBox="0 0 160 120"
        fill="none"
        aria-hidden="true"
        className="text-brand-500/40"
    >
        <rect x="36" y="14" width="88" height="92" rx="8" stroke="currentColor" strokeWidth="2" fill="white" />
        <line x1="48" y1="34" x2="112" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="48" x2="100" y2="48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="62" x2="112" y2="62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="76" x2="92" y2="76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="124" cy="14" r="14" fill="#EEF2FF" stroke="currentColor" strokeWidth="2" />
        <path d="M118 14 L122 18 L130 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
);

export default function Home() {
<<<<<<< Updated upstream
    const [resumes, setResumes] = useState<StoredResume[]>([]);

    useEffect(() => {
        setResumes(listResumes());
    }, []);

    return (
        <main>
            <Navbar />

            <section className="relative overflow-hidden" style={{ maxHeight: 360 }}>
                <div className="absolute inset-0 hero-pattern opacity-60 pointer-events-none" aria-hidden="true" />
                <div className="container-app relative z-10" style={{ paddingTop: 56, paddingBottom: 56 }}>
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
=======
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [showIntro, setShowIntro] = useState<boolean | null>(null);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    setShowIntro(!hasSeenIntro);
  }, []);

  useEffect(() => {
    if(showIntro === false && !auth.isAuthenticated) {
        navigate('/auth?next=/');
    }
  }, [auth.isAuthenticated, showIntro])

  useEffect(() => {
    if (showIntro !== false) return;

    const loadResumes = async () => {
      setLoadingResumes(true);

      const resumes = (await kv.list('resume:*', true)) as KVItem[];

      const parsedResumes = resumes?.map((resume) => (
          JSON.parse(resume.value) as Resume
      ))

      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    }

    loadResumes()
  }, [showIntro]);

  const handleIntroFinish = () => {
    setShowIntro(false);
    sessionStorage.setItem('hasSeenIntro', 'true');
  };

  if (showIntro === null) return null;

  if (showIntro) {
    return <Intro onFinish={handleIntroFinish} />;
  }

  return <main className="mesh-bg">
    {/* Decorative Glows */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-screen pointer-events-none overflow-hidden">
      <div className="absolute -top-[10%] -left-[10%] size-[500px] bg-indigo-500/10 blur-[120px] rounded-full" />
      <div className="absolute top-[20%] -right-[10%] size-[400px] bg-sky-500/10 blur-[120px] rounded-full" />
    </div>

    <Navbar />

    <section className="main-section">
      <div className="page-heading">
        <h1 className="text-gradient">Track Your Applications & <br className="hidden md:block" /> Resume Ratings</h1>
        {!loadingResumes && resumes?.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
        ): (
          <h2>Review your submissions and check AI-powered feedback.</h2>
        )}
      </div>

      {loadingResumes && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="size-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-600">AI</span>
              </div>
            </div>
            <p className="mt-4 text-slate-500 font-medium animate-pulse">Scanning your database...</p>
          </div>
      )}

      {!loadingResumes && resumes.length > 0 && (
        <div className="resumes-section">
          {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}

      {!loadingResumes && resumes?.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <Link to="/upload" className="primary-button scale-110 shadow-2xl">
              Upload Your First Resume
            </Link>
          </div>
      )}
    </section>
  </main>
>>>>>>> Stashed changes
}

<<<<<<< Updated upstream
import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
=======
import {Link, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";
>>>>>>> Stashed changes
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import JobRecommendations from "~/components/JobRecommendations";
<<<<<<< Updated upstream
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

                <div className="flex flex-col gap-5 content-narrow mx-auto">
                    {feedback ? (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="flex flex-col gap-5"
                        >
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />
                            <JobRecommendations skill={resume?.jobTitle || ""} />
                        </motion.div>
                    ) : (
                        <div className="card flex flex-col items-center" style={{ paddingTop: 48, paddingBottom: 48, gap: 12 }}>
                            <div className="flex items-center gap-2 text-text-tertiary">
                                <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                                <span style={{ fontSize: "var(--text-small)" }}>Loading analysis…</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Resume;
=======
import ResumeEditor from "~/components/ResumeEditor";
import JobOptimizer from "~/components/JobOptimizer";
import ResumeTemplate from "~/components/ResumeTemplate";
import { cn } from "~/lib/utils";

export const meta = () => ([
    { title: 'Resumind | Review ' },
    { name: 'description', content: 'Detailed overview of your resume' },
])

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [fullResume, setFullResume] = useState<Resume | null>(null);
    const [activeTab, setActiveTab] = useState<'insights' | 'editor' | 'optimize'>('insights');
    const [isSaving, setIsSaving] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading])

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);

            if(!resume) return;

            const data = JSON.parse(resume) as Resume;
            setFullResume(data);

            const resumeBlob = await fs.read(data.resumePath);
            if(!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            const imageBlob = await fs.read(data.imagePath);
            if(!imageBlob) return;
            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);

            setFeedback(data.feedback);
        }

        loadResume();
    }, [id]);

    const handleSaveResume = async (updatedData: ResumeData) => {
        if (!fullResume) return;
        setIsSaving(true);
        try {
            const updatedResume = { ...fullResume, structuredData: updatedData };
            await kv.set(`resume:${id}`, JSON.stringify(updatedResume));
            setFullResume(updatedResume);
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownload = () => {
        window.print();
    };

    if (isPreviewing && fullResume?.structuredData) {
        return (
            <div className="bg-slate-100 min-h-screen py-12 px-4">
                <div className="fixed top-8 left-8 z-50 print:hidden">
                    <button onClick={() => setIsPreviewing(false)} className="secondary-button !bg-white shadow-xl flex items-center gap-2">
                         <img src="/icons/back.svg" alt="back" className="w-3 h-3" />
                         Back to Editor
                    </button>
                </div>
                <div className="fixed top-8 right-8 z-50 print:hidden">
                    <button onClick={handleDownload} className="primary-button shadow-xl flex items-center gap-2">
                         <span>Download PDF</span>
                    </button>
                </div>
                <ResumeTemplate data={fullResume.structuredData} />
            </div>
        )
    }

    return (
        <main className="mesh-bg !pt-0 print:hidden">
            {/* Decorative Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-screen pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] size-[500px] bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] -right-[10%] size-[400px] bg-sky-500/10 blur-[120px] rounded-full" />
            </div>

            <nav className="resume-nav sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <Link to="/" className="secondary-button !py-2 flex items-center gap-2 group">
                        <img src="/icons/back.svg" alt="back" className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
                        <span className="text-sm font-bold">Dashboard</span>
                    </Link>
                    
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button 
                            onClick={() => setActiveTab('insights')}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                                activeTab === 'insights' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            Insights
                        </button>
                        <button 
                            onClick={() => setActiveTab('editor')}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                                activeTab === 'editor' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            Editor
                        </button>
                        <button 
                            onClick={() => setActiveTab('optimize')}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                                activeTab === 'optimize' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            Optimize
                        </button>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <button 
                        onClick={() => setIsPreviewing(true)}
                        className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                        Preview & Download
                    </button>
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                        <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">AI Sync Active</span>
                    </div>
                </div>
            </nav>

            <div className="relative z-10 flex flex-row w-full max-lg:flex-col min-h-[calc(100vh-80px)]">
                <section className="w-full lg:w-1/2 p-6 lg:p-12 flex items-center justify-center lg:sticky lg:top-20 lg:h-[calc(100vh-80px)]">
                    {imageUrl && resumeUrl ? (
                        <div className="w-full h-full max-w-2xl glass-card p-4 group overflow-hidden animate-in fade-in zoom-in-95 duration-1000">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl transition-transform duration-700 group-hover:scale-[1.01]"
                                    title="View Full Resume"
                                />
                                <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-2xl font-bold text-indigo-600">
                                        Open PDF Preview
                                    </div>
                                </div>
                            </a>
                        </div>
                    ) : (
                        <div className="w-full max-w-2xl aspect-[3/4] glass-card flex items-center justify-center">
                           <div className="size-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                        </div>
                    )}
                </section>

                <section className="w-full lg:w-1/2 p-6 lg:p-12 overflow-y-auto">
                    <div className="max-w-3xl">
                        {activeTab === 'insights' && (
                            <>
                                <header className="mb-12 animate-in fade-in slide-in-from-right-8 duration-700">
                                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Resume Insight</h2>
                                    <p className="text-lg text-slate-500 font-medium">Detailed breakdown and optimization strategies powered by Claude 3.5 Sonnet.</p>
                                </header>

                                {feedback ? (
                                    <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                                        <Summary feedback={feedback} />
                                        <div className="glass-card p-8">
                                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                                        </div>
                                        <Details feedback={feedback} />
                                        <JobRecommendations jobs={feedback.jobRecommendations || []} />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 gap-6 glass-card">
                                        <div className="relative">
                                            <div className="size-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                                            <img src="/images/resume-scan-2.gif" className="absolute inset-0 size-24 rounded-full mix-blend-multiply opacity-50" />
                                        </div>
                                        <p className="text-xl font-bold text-slate-900 animate-pulse">Synthesizing Feedback...</p>
                                    </div>
                                )}
                            </>
                        )}
                        
                        {activeTab === 'editor' && fullResume && (
                            <ResumeEditor resume={fullResume} onSave={handleSaveResume} />
                        )}

                        {activeTab === 'optimize' && fullResume?.structuredData && (
                            <JobOptimizer resumeData={fullResume.structuredData} />
                        )}
                    </div>
                </section>
            </div>
        </main>
    )
}

export default Resume
>>>>>>> Stashed changes

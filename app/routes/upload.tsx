<<<<<<< Updated upstream
import { type FormEvent, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { useNavigate } from "react-router";
import { generateUUID } from "~/lib/utils";
import { saveResume } from "~/lib/storage";
import { prepareInstructions } from "../../constants";

const STATUS_PROGRESS: Record<string, number> = {
    "Preparing data...": 20,
    "Analyzing...": 70,
    "Analysis complete, redirecting...": 100,
};

const Upload = () => {
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (f: File | null) => setFile(f);
=======
import {type FormEvent, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }
>>>>>>> Stashed changes

    const fail = (msg: string) => {
        setStatusText(msg);
        setIsProcessing(false);
    };

<<<<<<< Updated upstream
    const handleAnalyze = async ({
        companyName,
        jobTitle,
        jobDescription,
        file,
    }: {
        companyName: string;
        jobTitle: string;
        jobDescription: string;
        file: File;
    }) => {
        setIsProcessing(true);
        try {
            setStatusText("Preparing data...");
            const uuid = generateUUID();

            setStatusText("Analyzing...");
            const analyzeForm = new FormData();
            analyzeForm.append("file", file);
            analyzeForm.append("prompt", prepareInstructions({ jobTitle, jobDescription }));

            const analyzeRes = await fetch("/api/analyze", {
                method: "POST",
                body: analyzeForm,
            });
            if (!analyzeRes.ok) {
                const body = await analyzeRes.text().catch(() => "");
                console.error("Backend /api/analyze failed:", analyzeRes.status, body);
                // Try to surface the backend's `detail` message; fall back to status.
                let serverMsg = "";
                try {
                    serverMsg = (JSON.parse(body) as { detail?: string }).detail ?? "";
                } catch {
                    /* not JSON */
                }
                const hint =
                    analyzeRes.status === 0
                        ? " — is the backend running on :8000?"
                        : "";
                return fail(
                    `Error: ${serverMsg || `AI analysis failed (HTTP ${analyzeRes.status})`}${hint}`
                );
            }

            let feedback: Feedback;
            try {
                feedback = (await analyzeRes.json()) as Feedback;
            } catch (parseErr) {
                console.error("Failed to parse /api/analyze response:", parseErr);
                return fail("Error: AI response was not valid JSON (see console)");
            }

            saveResume({
                id: uuid,
                companyName,
                jobTitle,
                jobDescription,
                feedback,
                createdAt: Date.now(),
            });

            setStatusText("Analysis complete, redirecting...");
            navigate(`/resume/${uuid}`);
        } catch (err) {
            console.error("Analyze failed:", err);
            fail(`Error: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest("form");
        if (!form) return;
        const formData = new FormData(form);
        const companyName = formData.get("company-name") as string;
        const jobTitle = formData.get("job-title") as string;
        const jobDescription = formData.get("job-description") as string;
        if (!file) return;
        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    };

    const progress = STATUS_PROGRESS[statusText] ?? (isProcessing ? 10 : 0);
    const isErrorStatus = statusText.startsWith("Error");

    return (
        <main>
            <Navbar />

            {isProcessing && (
                <div className="sticky top-0 z-20 bg-white" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="container-app flex items-center gap-3" style={{ paddingTop: 10, paddingBottom: 10 }}>
                        <span className="inline-block w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                        <p
                            className="font-medium text-text-primary"
                            style={{ fontSize: "var(--text-small)" }}
                        >
                            {statusText}
                        </p>
                    </div>
                </div>
            )}

            <section className="container-app" style={{ paddingTop: 40, paddingBottom: 48 }}>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="page-heading"
                    style={{ marginBottom: 32 }}
                >
                    <span className="eyebrow">Smart Resume Feedback</span>
                    <h1>Analyze your resume</h1>
                    <p>Paste the job description, upload your PDF, and get a detailed ATS score plus tailored improvement tips in seconds.</p>
                </motion.div>

                {isErrorStatus && !isProcessing && (
                    <div
                        className="rounded-lg font-medium"
                        style={{
                            marginBottom: 20,
                            padding: "10px 16px",
                            fontSize: "var(--text-small)",
                            background: "var(--color-danger-soft)",
                            color: "var(--color-danger)",
                            border: "1px solid #fecaca",
                        }}
                    >
                        {statusText}
                    </div>
                )}

                <form
                    id="upload-form"
                    onSubmit={handleSubmit}
                    className={`grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-6 ${
                        isProcessing ? "opacity-50 pointer-events-none" : ""
                    }`}
                >
                    <div className="card flex flex-col" style={{ gap: 16 }}>
                        <h2>Job details</h2>

                        <div className="form-div">
                            <label htmlFor="company-name">Company name</label>
                            <input
                                type="text"
                                name="company-name"
                                placeholder="e.g. Google, Stripe, Acme Inc."
                                id="company-name"
                            />
                        </div>

                        <div className="form-div">
                            <label htmlFor="job-title">Job title</label>
                            <input
                                type="text"
                                name="job-title"
                                placeholder="e.g. Frontend Engineer"
                                id="job-title"
                            />
                            <p className="helper-text">Used to fetch matching job recommendations.</p>
                        </div>

                        <div className="form-div">
                            <label htmlFor="job-description">Job description</label>
                            <textarea
                                rows={8}
                                name="job-description"
                                placeholder="Paste the job description here…"
                                id="job-description"
                            />
                            <p className="helper-text">The richer the description, the more specific the feedback.</p>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary btn-block"
                            disabled={!file || isProcessing}
                            style={{ height: 44, marginTop: 4 }}
                        >
                            {isProcessing ? "Analyzing…" : "Analyze Resume"}
                        </button>
                    </div>

                    <div className="card flex flex-col" style={{ gap: 12 }}>
                        <h2>Resume PDF</h2>
                        <FileUploader onFileSelect={handleFileSelect} />
                        <p className="helper-text text-center">
                            Your PDF is sent to the analysis backend and is not stored.
                        </p>
                    </div>
                </form>
            </section>
        </main>
    );
};

export default Upload;
=======
    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        setIsProcessing(true);
        try {
            setStatusText('Uploading the file...');
            const uploadedFile = await fs.upload([file]);
            if(!uploadedFile) return fail('Error: Failed to upload file');

            setStatusText('Converting to image...');
            const imageFile = await convertPdfToImage(file);
            if(!imageFile.file) return fail(`Error: Failed to convert PDF to image${imageFile.error ? ` (${imageFile.error})` : ''}`);

            setStatusText('Uploading the image...');
            const uploadedImage = await fs.upload([imageFile.file]);
            if(!uploadedImage) return fail('Error: Failed to upload image');

            setStatusText('Preparing data...');
            const uuid = generateUUID();
            const data: any = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName, jobTitle, jobDescription,
                feedback: '',
            }
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            setStatusText('Analyzing...');

            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({ jobTitle, jobDescription })
            )
            if (!feedback) return fail('Error: Failed to analyze resume (no response)');

            const rawContent = (feedback as any)?.message?.content;
            const feedbackText = typeof rawContent === 'string'
                ? rawContent
                : Array.isArray(rawContent)
                    ? rawContent[0]?.text ?? ''
                    : '';

            if (!feedbackText) {
                console.error('AI response shape unexpected:', feedback);
                return fail('Error: AI returned empty response (see console)');
            }

            const cleaned = feedbackText
                .trim()
                .replace(/^```(?:json)?\s*/i, '')
                .replace(/```\s*$/, '')
                .trim();

            try {
                const parsed = JSON.parse(cleaned);
                data.feedback = parsed;
                if (parsed.structuredData) {
                    data.structuredData = parsed.structuredData;
                    // Remove it from feedback to keep it clean if desired, 
                    // or just leave it. Let's keep it at root for the Editor.
                }
            } catch (parseErr) {
                console.error('Failed to parse AI JSON:', parseErr, '\nRaw:', feedbackText);
                return fail('Error: AI response was not valid JSON (see console)');
            }

            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            setStatusText('Analysis complete, redirecting...');
            console.log(data);
            navigate(`/resume/${uuid}`);
        } catch (err) {
            console.error('Analyze failed:', err);
            fail(`Error: ${err instanceof Error ? err.message : String(err)}`);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="mesh-bg">
            {/* Decorative Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-screen pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] size-[500px] bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] -right-[10%] size-[400px] bg-sky-500/10 blur-[120px] rounded-full" />
            </div>

            <Navbar />

            <section className="main-section">
                <div className="page-heading">
                    <h1 className="text-gradient">Smart Feedback for Your Dream Job</h1>
                    <h2>Drop your resume for an AI-powered ATS score and improvement tips.</h2>
                </div>

                <div className="w-full max-w-2xl glass-card p-8 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {isProcessing ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-8 text-center">
                            <div className="relative">
                                <div className="size-32 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="size-20 bg-indigo-50 rounded-full flex items-center justify-center">
                                        <img src="/images/resume-scan.gif" className="size-16 rounded-full mix-blend-multiply" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-2xl font-bold text-slate-900">{statusText}</h3>
                                <p className="text-slate-500 font-medium animate-pulse">Our AI is analyzing every detail...</p>
                            </div>
                        </div>
                    ) : (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-8">
                            {statusText.startsWith('Error') && (
                                <div className="w-full p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 font-medium animate-in zoom-in-95">
                                    <div className="size-6 bg-red-100 rounded-full flex items-center justify-center text-xs">!</div>
                                    {statusText}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                <div className="form-div">
                                    <label htmlFor="company-name" className="text-sm font-bold uppercase tracking-wider text-slate-500 ml-1">Company Name</label>
                                    <input type="text" name="company-name" placeholder="e.g. Google" id="company-name" className="premium-input" />
                                </div>
                                <div className="form-div">
                                    <label htmlFor="job-title" className="text-sm font-bold uppercase tracking-wider text-slate-500 ml-1">Job Title</label>
                                    <input type="text" name="job-title" placeholder="e.g. Senior Engineer" id="job-title" className="premium-input" />
                                </div>
                            </div>

                            <div className="form-div">
                                <label htmlFor="job-description" className="text-sm font-bold uppercase tracking-wider text-slate-500 ml-1">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Paste the job requirements here..." id="job-description" className="premium-input" />
                            </div>

                            <div className="form-div">
                                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 ml-1">Upload Resume (PDF)</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button py-4 text-lg shadow-xl" type="submit">
                                Start AI Analysis
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}
export default Upload
>>>>>>> Stashed changes

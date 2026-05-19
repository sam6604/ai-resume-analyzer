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

    const fail = (msg: string) => {
        setStatusText(msg);
        setIsProcessing(false);
    };

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

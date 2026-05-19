import { type FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import AnalysisScanner from "~/components/AnalysisScanner";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { saveResume, type EditSuggestion, type ResumeProfile } from "~/lib/storage";
import { prepareInstructions } from "../../constants";

const Upload = () => {
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileSelect = (f: File | null) => setFile(f);

    const fail = (msg: string) => {
        setStatusText(msg);
        setIsProcessing(false);
        setPreviewUrl(null);
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
        setPreviewUrl(null);

        try {
            // ---------- Stage 1: Uploading ----------
            setStatusText("Uploading your resume...");

            // Kick the PDF→PNG conversion off in parallel — the scanner shows
            // the skeleton until this resolves, then crossfades to the preview.
            const previewTask = convertPdfToImage(file)
                .then((r) => {
                    if (r.imageUrl) setPreviewUrl(r.imageUrl);
                    return r;
                })
                .catch((err) => {
                    // Scanner stays on skeleton — not fatal.
                    console.warn("Preview conversion failed (non-fatal):", err);
                    return null;
                });

            // ---------- Stage 2: Converting ----------
            setStatusText("Converting and preparing pages...");
            await previewTask;

            // ---------- Stage 3: Analyzing ----------
            setStatusText("Analyzing with AI...");
            const uuid = generateUUID();

            // Same PDF, three endpoints — each fetch consumes its FormData stream.
            const analyzeForm = new FormData();
            analyzeForm.append("file", file);
            analyzeForm.append("prompt", prepareInstructions({ jobTitle, jobDescription }));

            const suggestForm = new FormData();
            suggestForm.append("file", file);
            suggestForm.append("job_title", jobTitle);
            suggestForm.append("job_description", jobDescription);

            const profileForm = new FormData();
            profileForm.append("file", file);

            const mkTimeout = () => {
                const c = new AbortController();
                const id = window.setTimeout(() => c.abort(), 90_000);
                return { signal: c.signal, clear: () => window.clearTimeout(id) };
            };
            const t1 = mkTimeout();
            const t2 = mkTimeout();
            const t3 = mkTimeout();

            const [analyzeSettled, suggestSettled, profileSettled] = await Promise.allSettled([
                fetch("/api/analyze", { method: "POST", body: analyzeForm, signal: t1.signal }),
                fetch("/api/suggest-edits", { method: "POST", body: suggestForm, signal: t2.signal }),
                fetch("/api/extract-profile", { method: "POST", body: profileForm, signal: t3.signal }),
            ]);
            t1.clear();
            t2.clear();
            t3.clear();

            if (analyzeSettled.status === "rejected") {
                const err = analyzeSettled.reason as Error;
                if (err?.name === "AbortError") {
                    return fail("Error: Analysis timed out after 90 s. Is the backend reachable?");
                }
                console.error("fetch /api/analyze threw:", err);
                return fail(
                    "Error: Cannot reach backend. Make sure 'uvicorn job_matcher.api:app --port 8000' is running."
                );
            }
            const analyzeRes = analyzeSettled.value;
            if (!analyzeRes.ok) {
                const body = await analyzeRes.text().catch(() => "");
                console.error("Backend /api/analyze failed:", analyzeRes.status, body);
                let serverMsg = "";
                try {
                    serverMsg = (JSON.parse(body) as { detail?: string }).detail ?? "";
                } catch {
                    /* not JSON */
                }
                return fail(
                    `Error: ${serverMsg || `AI analysis failed (HTTP ${analyzeRes.status})`}`
                );
            }

            let feedback: Feedback;
            try {
                feedback = (await analyzeRes.json()) as Feedback;
            } catch (parseErr) {
                console.error("Failed to parse /api/analyze response:", parseErr);
                return fail("Error: AI response was not valid JSON (see console)");
            }

            let edits: EditSuggestion[] = [];
            if (suggestSettled.status === "fulfilled" && suggestSettled.value.ok) {
                try {
                    edits = (await suggestSettled.value.json()) as EditSuggestion[];
                } catch (e) {
                    console.warn("Failed to parse /api/suggest-edits response:", e);
                }
            } else if (suggestSettled.status === "fulfilled") {
                console.warn(
                    "/api/suggest-edits returned HTTP",
                    suggestSettled.value.status,
                    "— continuing without suggestions"
                );
            } else {
                console.warn("/api/suggest-edits failed:", suggestSettled.reason);
            }

            let profile: ResumeProfile | undefined;
            if (profileSettled.status === "fulfilled" && profileSettled.value.ok) {
                try {
                    profile = (await profileSettled.value.json()) as ResumeProfile;
                } catch (e) {
                    console.warn("Failed to parse /api/extract-profile response:", e);
                }
            } else if (profileSettled.status === "fulfilled") {
                console.warn(
                    "/api/extract-profile returned HTTP",
                    profileSettled.value.status,
                    "— continuing without job match scoring"
                );
            } else {
                console.warn("/api/extract-profile failed:", profileSettled.reason);
            }

            // ---------- Stage 4: Finalizing ----------
            setStatusText("Finalizing your report...");
            saveResume({
                id: uuid,
                companyName,
                jobTitle,
                jobDescription,
                feedback,
                edits,
                profile,
                createdAt: Date.now(),
            });

            setStatusText("Analysis complete, redirecting...");

            // Give the scanner ~500 ms to settle on the final stage + fade out
            // before we navigate away.
            window.setTimeout(() => {
                setIsProcessing(false);
                navigate(`/resume/${uuid}`);
            }, 500);
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

    const isErrorStatus = statusText.startsWith("Error");

    return (
        <main>
            <Navbar />

            <AnimatePresence mode="wait">
                {isProcessing ? (
                    <motion.div
                        key="scanner"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                        <AnalysisScanner statusText={statusText} imageUrl={previewUrl} />
                    </motion.div>
                ) : (
                    <motion.section
                        key="form"
                        className="container-app"
                        style={{ paddingTop: 40, paddingBottom: 48 }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <div className="page-heading" style={{ marginBottom: 32 }}>
                            <span className="eyebrow">Smart Resume Feedback</span>
                            <h1>Analyze your resume</h1>
                            <p>
                                Paste the job description, upload your PDF, and get a detailed ATS
                                score plus tailored improvement tips in seconds.
                            </p>
                        </div>

                        {isErrorStatus && (
                            <div
                                className="rounded-lg font-medium"
                                style={{
                                    marginBottom: 20,
                                    padding: "10px 16px",
                                    fontSize: "var(--text-small)",
                                    background: "var(--color-danger-soft)",
                                    color: "var(--color-danger)",
                                    border: "1px solid var(--color-danger-border)",
                                }}
                            >
                                {statusText}
                            </div>
                        )}

                        <form
                            id="upload-form"
                            onSubmit={handleSubmit}
                            className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-6"
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
                                    <p className="helper-text">
                                        Used to fetch matching job recommendations.
                                    </p>
                                </div>

                                <div className="form-div">
                                    <label htmlFor="job-description">Job description</label>
                                    <textarea
                                        rows={8}
                                        name="job-description"
                                        placeholder="Paste the job description here…"
                                        id="job-description"
                                    />
                                    <p className="helper-text">
                                        The richer the description, the more specific the feedback.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary btn-block"
                                    disabled={!file}
                                    style={{ height: 44, marginTop: 4 }}
                                >
                                    Analyze Resume
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
                    </motion.section>
                )}
            </AnimatePresence>
        </main>
    );
};

export default Upload;

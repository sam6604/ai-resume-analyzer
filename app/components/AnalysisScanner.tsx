import { AnimatePresence, motion } from "framer-motion";

interface AnalysisScannerProps {
    statusText: string;
    imageUrl: string | null;
}

interface Stage {
    key: "upload" | "convert" | "analyze" | "final";
    label: string;
}

const STAGES: readonly Stage[] = [
    { key: "upload", label: "Uploading" },
    { key: "convert", label: "Converting" },
    { key: "analyze", label: "Analyzing" },
    { key: "final", label: "Finalizing" },
] as const;

const stageIndexFromStatus = (status: string): number => {
    const s = status.toLowerCase();
    if (/final|complete|redirect|saving/.test(s)) return 3;
    if (/analyz/.test(s)) return 2;
    if (/convert/.test(s)) return 1;
    if (/upload|prepar|reading/.test(s)) return 0;
    return 0;
};

const AnalysisScanner = ({ statusText, imageUrl }: AnalysisScannerProps) => {
    const current = stageIndexFromStatus(statusText);

    return (
        <div
            role="status"
            aria-live="polite"
            aria-label="Analyzing your resume"
            className="scanner-shell"
        >
            <div className="scanner-image-wrap" aria-hidden="true">
                <span className="scan-corner scan-corner-tl" />
                <span className="scan-corner scan-corner-tr" />
                <span className="scan-corner scan-corner-bl" />
                <span className="scan-corner scan-corner-br" />

                <div className="scanner-image-frame">
                    <AnimatePresence mode="wait">
                        {imageUrl ? (
                            <motion.img
                                key="preview"
                                src={imageUrl}
                                alt=""
                                className="scanner-image"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.45, ease: "easeOut" }}
                                draggable={false}
                            />
                        ) : (
                            <motion.div
                                key="skeleton"
                                className="scanner-skeleton"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                            />
                        )}
                    </AnimatePresence>

                    <div className="scan-line" />
                </div>
            </div>

            <div className="scanner-status">
                <div className="dot-loader" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </div>

                <div style={{ position: "relative", height: 22 }}>
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={statusText || "idle"}
                            className="scanner-status-text"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                        >
                            {statusText || "Preparing…"}
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>

            <ol className="scanner-stages" aria-label="Analysis progress">
                {STAGES.map((stage, i) => {
                    const state: "done" | "active" | "pending" =
                        i < current ? "done" : i === current ? "active" : "pending";
                    return (
                        <li key={stage.key} className="contents">
                            <span
                                className="stage-pill"
                                data-state={state}
                                aria-current={state === "active" ? "step" : undefined}
                            >
                                <span className="stage-dot" aria-hidden="true" />
                                <span>{stage.label}</span>
                            </span>
                            {i < STAGES.length - 1 && (
                                <span
                                    className="stage-connector"
                                    data-done={i < current}
                                    aria-hidden="true"
                                />
                            )}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

export default AnalysisScanner;

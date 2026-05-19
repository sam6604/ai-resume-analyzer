import { useEffect, useState } from "react";
import { Link } from "react-router";
import Navbar from "~/components/Navbar";
import { listResumes, wipeAll, type StoredResume } from "~/lib/storage";

const Wipe = () => {
    const [resumes, setResumes] = useState<StoredResume[]>([]);
    const [wiped, setWiped] = useState(false);

    useEffect(() => {
        setResumes(listResumes());
    }, []);

    const handleWipe = () => {
        wipeAll();
        setResumes([]);
        setWiped(true);
    };

    return (
        <main>
            <Navbar />
            <section className="container-app" style={{ paddingTop: 40, paddingBottom: 48 }}>
                <div className="page-heading" style={{ marginBottom: 24 }}>
                    <span className="eyebrow">Maintenance</span>
                    <h1>Wipe local data</h1>
                    <p>Clears all saved resume analyses from this browser. Server-side data is unaffected.</p>
                </div>

                <div className="card">
                    <h2>Stored analyses ({resumes.length})</h2>
                    {resumes.length === 0 ? (
                        <p className="mt-3" style={{ fontSize: "var(--text-small)" }}>
                            {wiped ? "All data cleared." : "Nothing stored."}
                        </p>
                    ) : (
                        <ul className="mt-3 flex flex-col" style={{ gap: 8 }}>
                            {resumes.map((r) => (
                                <li
                                    key={r.id}
                                    className="flex items-center justify-between"
                                    style={{
                                        padding: "10px 12px",
                                        border: "1px solid var(--color-border)",
                                        borderRadius: 8,
                                        fontSize: "var(--text-small)",
                                    }}
                                >
                                    <span className="text-text-primary font-medium truncate">
                                        {r.companyName || "Untitled"} · {r.jobTitle || "—"}
                                    </span>
                                    <span className="text-text-tertiary num">{r.feedback.overallScore}/100</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="flex items-center gap-3 mt-5">
                        <button
                            className="btn-primary"
                            onClick={handleWipe}
                            disabled={resumes.length === 0}
                            style={{ background: "var(--color-danger)" }}
                        >
                            Wipe all data
                        </button>
                        <Link to="/" className="btn-secondary">
                            Back to home
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Wipe;

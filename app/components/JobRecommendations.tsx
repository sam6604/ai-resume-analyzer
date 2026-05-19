import { useEffect, useState } from "react";
import type { ResumeProfile } from "~/lib/storage";

interface ApiJob {
    id: string;
    source: string;
    title: string;
    company: string;
    location: string;
    description: string;
    url: string;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string | null;
    posted_at: string | null;
}

interface JobScore {
    match_score: number;
    reason: string;
}

interface JobRecommendationsProps {
    skill: string;
    profile?: ResumeProfile;
    defaultLocation?: string;
}

const formatSalary = (job: ApiJob): string | null => {
    if (job.salary_min == null && job.salary_max == null) return null;
    const cur = job.salary_currency || "";
    const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (job.salary_min != null && job.salary_max != null) {
        return `${cur} ${fmt(job.salary_min)} – ${fmt(job.salary_max)}`.trim();
    }
    const single = job.salary_min ?? job.salary_max!;
    return `${cur} ${fmt(single)}`.trim();
};

const matchColor = (score: number): { bg: string; text: string; border: string } => {
    if (score >= 70) {
        return {
            bg: "var(--color-success-soft)",
            text: "var(--color-success-text)",
            border: "var(--color-success-border)",
        };
    }
    if (score >= 50) {
        return {
            bg: "var(--color-warning-soft)",
            text: "var(--color-warning-text)",
            border: "var(--color-warning-border)",
        };
    }
    return {
        bg: "var(--color-danger-soft)",
        text: "var(--color-danger-text)",
        border: "var(--color-danger-border)",
    };
};

const MatchChip = ({
    score,
    reason,
    loading,
}: {
    score: number | null;
    reason: string;
    loading: boolean;
}) => {
    if (loading) {
        return (
            <span
                className="num"
                style={{
                    fontSize: "var(--text-tiny)",
                    color: "var(--color-text-tertiary)",
                    padding: "3px 10px",
                    borderRadius: 999,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card-bg-elevated)",
                    whiteSpace: "nowrap",
                }}
            >
                scoring…
            </span>
        );
    }
    if (score == null) return null;
    const c = matchColor(score);
    return (
        <span
            title={reason}
            className="num font-semibold"
            style={{
                fontSize: "var(--text-tiny)",
                color: c.text,
                background: c.bg,
                border: `1px solid ${c.border}`,
                padding: "3px 10px",
                borderRadius: 999,
                whiteSpace: "nowrap",
            }}
        >
            {score}% match
        </span>
    );
};

const JobRecommendations = ({
    skill,
    profile,
    defaultLocation = "india",
}: JobRecommendationsProps) => {
    const [location, setLocation] = useState(defaultLocation);
    const [jobs, setJobs] = useState<ApiJob[]>([]);
    const [scores, setScores] = useState<Record<string, JobScore>>({});
    const [scoring, setScoring] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const canScore = !!(profile && profile.summary);

    const fetchScores = async (loadedJobs: ApiJob[]) => {
        if (!canScore || loadedJobs.length === 0) return;
        setScoring(true);
        try {
            const payload = {
                profile,
                jobs: loadedJobs.map((j) => ({
                    id: j.id,
                    title: j.title,
                    description: j.description,
                })),
            };
            const res = await fetch("/api/score-jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                console.warn("/api/score-jobs returned HTTP", res.status);
                return;
            }
            const data: Array<{ id: string; match_score: number; reason: string }> =
                await res.json();
            const map: Record<string, JobScore> = {};
            for (const s of data) {
                map[s.id] = { match_score: s.match_score, reason: s.reason };
            }
            setScores(map);
        } catch (e) {
            console.warn("Job scoring failed (non-fatal):", e);
        } finally {
            setScoring(false);
        }
    };

    const fetchJobs = async () => {
        if (!skill?.trim()) {
            setError("No job title on this resume — cannot search.");
            return;
        }
        setLoading(true);
        setError(null);
        setScores({});
        try {
            const params = new URLSearchParams({ skill, location, limit: "10" });
            const res = await fetch(`/api/jobs?${params.toString()}`);
            if (!res.ok) {
                const body = await res.text();
                throw new Error(`API ${res.status}: ${body.slice(0, 120)}`);
            }
            const data: ApiJob[] = await res.json();
            setJobs(data);
            setHasFetched(true);
            // Kick off scoring after we have jobs — non-blocking for the UI.
            fetchScores(data);
        } catch (e) {
            console.error("Job fetch failed:", e);
            setError(
                e instanceof Error
                    ? `${e.message} — is the backend running on :8000?`
                    : String(e)
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (skill?.trim()) fetchJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [skill]);

    return (
        <div className="card">
            <div
                className="flex flex-row items-center justify-between flex-wrap"
                style={{ gap: 12, marginBottom: 8 }}
            >
                <div className="flex flex-col">
                    <span className="eyebrow">Live Jobs</span>
                    <h2 style={{ marginTop: 2 }}>Recommended for you</h2>
                </div>
                <div className="flex items-center" style={{ gap: 8 }}>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Location"
                        style={{ width: 160, height: 32, fontSize: "var(--text-small)" }}
                    />
                    <button onClick={fetchJobs} disabled={loading} className="btn-secondary btn-sm">
                        {loading ? "Searching…" : "Refresh"}
                    </button>
                </div>
            </div>

            <p style={{ fontSize: "var(--text-small)", marginBottom: 16 }}>
                Showing roles for{" "}
                <span className="font-medium text-text-primary">{skill || "(no title)"}</span> in{" "}
                <span className="font-medium text-text-primary">{location}</span>.
                {canScore && " Match scored against your resume profile."}
                {" "}Powered by Adzuna.
            </p>

            {loading && (
                <div className="flex items-center text-text-tertiary" style={{ gap: 8 }}>
                    <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                    <span style={{ fontSize: "var(--text-small)" }}>Loading jobs…</span>
                </div>
            )}

            {error && (
                <div
                    className="rounded-lg font-medium"
                    style={{
                        padding: "10px 16px",
                        fontSize: "var(--text-small)",
                        background: "var(--color-danger-soft)",
                        color: "var(--color-danger)",
                        border: "1px solid var(--color-danger-border)",
                    }}
                >
                    {error}
                </div>
            )}

            {!loading && !error && hasFetched && jobs.length === 0 && (
                <p
                    className="text-text-tertiary italic"
                    style={{ fontSize: "var(--text-small)" }}
                >
                    No jobs found for this title and location. Try a broader search term.
                </p>
            )}

            <div
                className="grid grid-cols-1 lg:grid-cols-2"
                style={{ gap: 10, marginTop: jobs.length > 0 ? 12 : 0 }}
            >
                {jobs.map((job) => {
                    const salary = formatSalary(job);
                    const scoreEntry = scores[job.id];
                    return (
                        <div key={job.id} className="card-tight card-hover">
                            <div
                                className="flex items-center justify-between"
                                style={{ gap: 8, marginBottom: 6 }}
                            >
                                <MatchChip
                                    score={scoreEntry?.match_score ?? null}
                                    reason={scoreEntry?.reason ?? ""}
                                    loading={canScore && scoring && !scoreEntry}
                                />
                                <a
                                    href={job.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary btn-sm whitespace-nowrap"
                                >
                                    Apply →
                                </a>
                            </div>
                            <h3 className="truncate" style={{ fontSize: "var(--text-sub)" }}>
                                {job.title}
                            </h3>
                            <p
                                className="text-text-secondary truncate"
                                style={{ fontSize: "var(--text-small)" }}
                            >
                                {job.company} · {job.location}
                            </p>
                            {salary && (
                                <p
                                    className="font-medium num"
                                    style={{
                                        fontSize: "var(--text-small)",
                                        marginTop: 4,
                                        color: "var(--color-success)",
                                    }}
                                >
                                    {salary}
                                </p>
                            )}
                            {scoreEntry?.reason && (
                                <p
                                    className="text-text-tertiary"
                                    style={{
                                        fontSize: "var(--text-tiny)",
                                        lineHeight: 1.4,
                                        marginTop: 6,
                                        fontStyle: "italic",
                                    }}
                                >
                                    {scoreEntry.reason}
                                </p>
                            )}
                            {job.description && (
                                <p
                                    className="text-text-secondary line-clamp-2"
                                    style={{
                                        fontSize: "var(--text-small)",
                                        lineHeight: 1.5,
                                        marginTop: 8,
                                    }}
                                >
                                    {job.description}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default JobRecommendations;

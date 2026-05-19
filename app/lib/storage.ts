// Browser-side persistence for analyzed resumes. Replaces Puter KV/fs.
// We store metadata + feedback in localStorage (PDFs are not persisted
// across sessions — that would need IndexedDB and isn't worth it for
// a demo build).

const KEY = "resumind:resumes";

export interface EditSuggestion {
    section: string;
    original: string;
    suggested: string;
    reason: string;
}

export interface ResumeProfile {
    summary: string;
    top_skills: string[];
    years_experience: string;
    key_strengths: string[];
    domains: string[];
}

export interface StoredResume {
    id: string;
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    feedback: Feedback;
    edits?: EditSuggestion[];
    profile?: ResumeProfile;
    createdAt: number;
}

const readAll = (): Record<string, StoredResume> => {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
};

const writeAll = (all: Record<string, StoredResume>): void => {
    localStorage.setItem(KEY, JSON.stringify(all));
};

export const listResumes = (): StoredResume[] => {
    const all = readAll();
    return Object.values(all).sort((a, b) => b.createdAt - a.createdAt);
};

export const getResume = (id: string): StoredResume | null => {
    return readAll()[id] ?? null;
};

export const saveResume = (resume: StoredResume): void => {
    const all = readAll();
    all[resume.id] = resume;
    writeAll(all);
};

export const deleteResume = (id: string): void => {
    const all = readAll();
    delete all[id];
    writeAll(all);
};

export const wipeAll = (): void => {
    localStorage.removeItem(KEY);
};

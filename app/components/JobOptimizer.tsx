import { useState } from "react";
import { usePuterStore } from "~/lib/puter";

interface JobOptimizerProps {
    resumeData: ResumeData;
}

interface OptimizationResult {
    matchScore: number;
    missingKeywords: string[];
    skillGaps: string[];
    suggestedChanges: {
        section: string;
        current: string;
        suggestion: string;
        reason: string;
    }[];
}

const JobOptimizer = ({ resumeData }: JobOptimizerProps) => {
    const [jobDescription, setJobDescription] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<OptimizationResult | null>(null);
    const { ai } = usePuterStore();

    const handleOptimize = async () => {
        if (!jobDescription.trim()) return;
        setIsAnalyzing(true);
        try {
            const prompt = `
                Analyze the following resume data against this job description.
                Resume Data: ${JSON.stringify(resumeData)}
                Job Description: ${jobDescription}
                
                Provide a JSON response with:
                1. matchScore (0-100)
                2. missingKeywords (list of important keywords from JD not in resume)
                3. skillGaps (skills mentioned in JD but missing in resume)
                4. suggestedChanges (specific advice for existing resume sections)
                
                Format the response as a JSON object only.
            `;
            
            const response = await ai.chat(prompt);
            const content = (response as any)?.message?.content;
            
            const rawContent = typeof content === 'string' ? content : content?.[0]?.text || '';
            const cleaned = rawContent.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
            
            setResult(JSON.parse(cleaned));
        } catch (error) {
            console.error("Optimization failed:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
                        <span className="text-white text-xl">🎯</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Job Role Optimizer</h2>
                </div>
                <p className="text-slate-500 font-medium">Target a specific role by comparing your resume with a job description.</p>
            </header>

            <div className="glass-card p-8 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-black uppercase tracking-widest text-slate-400 ml-1">Paste Job Description</label>
                    <textarea 
                        rows={8}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the requirements for the job you want here..."
                        className="premium-input !bg-slate-50/50"
                    />
                </div>
                <button 
                    onClick={handleOptimize}
                    disabled={isAnalyzing || !jobDescription.trim()}
                    className="primary-button !bg-sky-600 hover:bg-sky-700 shadow-sky-500/20 py-4 text-lg"
                >
                    {isAnalyzing ? "Analyzing Match..." : "Analyze Job Match"}
                </button>
            </div>

            {result && (
                <div className="flex flex-col gap-8 animate-in zoom-in-95 duration-700">
                    {/* Score Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card p-6 flex flex-col items-center justify-center text-center gap-2 border-b-4 border-b-sky-500">
                            <span className="text-4xl font-black text-slate-900">{result.matchScore}%</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Match Score</span>
                        </div>
                        <div className="glass-card p-6 flex flex-col items-center justify-center text-center gap-2 border-b-4 border-b-amber-500">
                            <span className="text-4xl font-black text-slate-900">{result.missingKeywords.length}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Missing Keywords</span>
                        </div>
                        <div className="glass-card p-6 flex flex-col items-center justify-center text-center gap-2 border-b-4 border-b-indigo-500">
                            <span className="text-4xl font-black text-slate-900">{result.skillGaps.length}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Skill Gaps</span>
                        </div>
                    </div>

                    {/* Keywords & Skills */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section className="glass-card p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="text-amber-500">🔑</span> Missing Keywords
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {result.missingKeywords.map((kw, i) => (
                                    <span key={i} className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-100">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </section>
                        <section className="glass-card p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="text-indigo-500">🛠️</span> Skill Gaps
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {result.skillGaps.map((skill, i) => (
                                    <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-indigo-100">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Suggested Changes */}
                    <section className="flex flex-col gap-4">
                        <h3 className="text-xl font-bold text-slate-900 ml-1">Optimization Recommendations</h3>
                        <div className="flex flex-col gap-4">
                            {result.suggestedChanges.map((change, i) => (
                                <div key={i} className="glass-card p-6 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black uppercase tracking-widest text-sky-600">{change.section}</span>
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">Recommended Fix</span>
                                    </div>
                                    <p className="text-sm text-slate-500 line-through italic">{change.current}</p>
                                    <p className="text-base font-bold text-slate-900 bg-green-50/50 p-4 rounded-xl border border-green-100">{change.suggestion}</p>
                                    <p className="text-xs font-medium text-slate-400">Why: {change.reason}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default JobOptimizer;

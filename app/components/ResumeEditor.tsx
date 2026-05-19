import { useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { cn } from "~/lib/utils";

interface ResumeEditorProps {
    resume: Resume;
    onSave: (updatedData: ResumeData) => void;
}

const ResumeEditor = ({ resume, onSave }: ResumeEditorProps) => {
    const defaultData: ResumeData = {
        personalInfo: { fullName: '', email: '', phone: '', location: '', website: '', summary: '' },
        experience: [],
        education: [],
        skills: []
    };

    const [data, setData] = useState<ResumeData>({
        ...defaultData,
        ...resume.structuredData,
        personalInfo: { ...defaultData.personalInfo, ...(resume.structuredData?.personalInfo || {}) },
        experience: (resume.structuredData?.experience || []).map(exp => ({ ...exp, id: exp.id || Math.random().toString(36).substr(2, 9) })),
        education: (resume.structuredData?.education || []).map(edu => ({ ...edu, id: edu.id || Math.random().toString(36).substr(2, 9) })),
        skills: resume.structuredData?.skills || []
    });

    const { ai } = usePuterStore();
    const [isRewriting, setIsRewriting] = useState<string | null>(null);

    const handlePersonalInfoChange = (field: keyof ResumeData['personalInfo'], value: string) => {
        setData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [field]: value }
        }));
    };

    const handleExperienceChange = (id: string, field: keyof ResumeData['experience'][0], value: string) => {
        setData(prev => ({
            ...prev,
            experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
        }));
    };

    const handleEducationChange = (id: string, field: keyof ResumeData['education'][0], value: string) => {
        setData(prev => ({
            ...prev,
            education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
        }));
    };

    const handleSkillChange = (index: number, value: string) => {
        const newSkills = [...data.skills];
        newSkills[index] = value;
        setData(prev => ({ ...prev, skills: newSkills }));
    };

    const addSkill = () => setData(prev => ({ ...prev, skills: [...prev.skills, ''] }));
    const removeSkill = (index: number) => setData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));

    const handleRewrite = async (id: string, currentText: string) => {
        setIsRewriting(id);
        try {
            const prompt = `Rewrite the following professional experience description to be more impactful, achievement-oriented, and ATS-friendly. Keep it concise and use bullet points if appropriate. Focus on measurable results. Text: "${currentText}"`;
            const response = await ai.chat(prompt);
            let rewrittenText = (response as any)?.message?.content;
            
            if (typeof rewrittenText !== 'string' && Array.isArray(rewrittenText)) {
                rewrittenText = rewrittenText[0]?.text;
            }

            if (rewrittenText) {
                handleExperienceChange(id, 'description', rewrittenText);
            }
        } catch (error) {
            console.error("Failed to rewrite:", error);
        } finally {
            setIsRewriting(null);
        }
    };

    return (
        <div className="flex flex-col gap-12 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <span className="text-white text-xl">✍️</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Interactive Editor</h2>
                </div>
                <p className="text-slate-500 font-medium">Refine your details and use AI to polish your descriptions for maximum impact.</p>
            </header>

            {/* Personal Information */}
            <section className="glass-card p-8 flex flex-col gap-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <span className="text-xl">👤</span>
                    <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                        <input 
                            type="text" 
                            value={data.personalInfo.fullName} 
                            onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                            className="premium-input !p-3"
                            placeholder="Your Name"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                        <input 
                            type="email" 
                            value={data.personalInfo.email} 
                            onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                            className="premium-input !p-3"
                            placeholder="email@example.com"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Phone</label>
                        <input 
                            type="text" 
                            value={data.personalInfo.phone} 
                            onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                            className="premium-input !p-3"
                            placeholder="+1 234 567 890"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Location</label>
                        <input 
                            type="text" 
                            value={data.personalInfo.location} 
                            onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                            className="premium-input !p-3"
                            placeholder="City, Country"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Professional Summary</label>
                    <textarea 
                        rows={4}
                        value={data.personalInfo.summary} 
                        onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                        className="premium-input !p-3"
                        placeholder="Write a brief overview of your professional background..."
                    />
                </div>
            </section>

            {/* Experience */}
            <section className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 px-1">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">💼</span>
                        <h3 className="text-xl font-bold text-slate-900">Work Experience</h3>
                    </div>
                    <button className="secondary-button !py-1.5 !px-4 text-xs">Add Experience</button>
                </div>
                
                <div className="flex flex-col gap-8">
                    {data.experience.map((exp) => (
                        <div key={exp.id} className="glass-card p-8 flex flex-col gap-6 relative group border-l-4 border-l-indigo-600">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Company</label>
                                    <input 
                                        value={exp.company}
                                        onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                                        className="premium-input !p-3 font-bold"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Position</label>
                                    <input 
                                        value={exp.position}
                                        onChange={(e) => handleExperienceChange(exp.id, 'position', e.target.value)}
                                        className="premium-input !p-3"
                                    />
                                </div>
                            </div>
                            
                            <div className="relative">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-1 block">Description & Achievements</label>
                                <textarea 
                                    rows={6}
                                    value={exp.description}
                                    onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)}
                                    className="premium-input !p-4 !bg-slate-50/50 leading-relaxed"
                                />
                                <button 
                                    onClick={() => handleRewrite(exp.id, exp.description)}
                                    disabled={isRewriting === exp.id}
                                    className="absolute bottom-4 right-4 primary-button !py-2 !px-5 !text-xs !rounded-xl flex items-center gap-2 shadow-xl shadow-indigo-600/20"
                                >
                                    {isRewriting === exp.id ? (
                                        <div className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <span className="text-sm">✨</span>
                                    )}
                                    {isRewriting === exp.id ? 'Optimizing...' : 'AI Rewrite'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Education */}
            <section className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 px-1">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">🎓</span>
                        <h3 className="text-xl font-bold text-slate-900">Education</h3>
                    </div>
                    <button className="secondary-button !py-1.5 !px-4 text-xs">Add Education</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.education.map((edu) => (
                        <div key={edu.id} className="glass-card p-6 flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">School / University</label>
                                <input 
                                    value={edu.school}
                                    onChange={(e) => handleEducationChange(edu.id, 'school', e.target.value)}
                                    className="premium-input !p-3 font-bold"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Degree & Field</label>
                                <input 
                                    value={`${edu.degree} in ${edu.field}`}
                                    onChange={(e) => {
                                        const parts = e.target.value.split(' in ');
                                        handleEducationChange(edu.id, 'degree', parts[0] || '');
                                        handleEducationChange(edu.id, 'field', parts[1] || '');
                                    }}
                                    className="premium-input !p-3"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Skills */}
            <section className="glass-card p-8 flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">🛠️</span>
                        <h3 className="text-xl font-bold text-slate-900">Technical Skills</h3>
                    </div>
                    <button onClick={addSkill} className="secondary-button !py-1.5 !px-4 text-xs">Add Skill</button>
                </div>
                <div className="flex flex-wrap gap-3">
                    {data.skills.map((skill, index) => (
                        <div key={index} className="group relative">
                            <input 
                                value={skill}
                                onChange={(e) => handleSkillChange(index, e.target.value)}
                                className="bg-indigo-50 text-indigo-700 font-bold px-4 py-2 rounded-xl border border-indigo-100 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all min-w-[120px]"
                            />
                            <button 
                                onClick={() => removeSkill(index)}
                                className="absolute -top-2 -right-2 size-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-right-8 duration-500">
                <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-white/50">
                    <button 
                        className="secondary-button !py-3 !px-8 shadow-lg" 
                        onClick={() => setData({
                            ...defaultData,
                            ...resume.structuredData,
                            personalInfo: { ...defaultData.personalInfo, ...(resume.structuredData?.personalInfo || {}) },
                            experience: (resume.structuredData?.experience || []).map(exp => ({ ...exp, id: exp.id || Math.random().toString(36).substr(2, 9) })),
                            education: (resume.structuredData?.education || []).map(edu => ({ ...edu, id: edu.id || Math.random().toString(36).substr(2, 9) })),
                            skills: resume.structuredData?.skills || []
                        })}
                    >
                        Reset
                    </button>
                    <button className="primary-button !py-3 !px-12 shadow-xl shadow-indigo-600/30" onClick={() => onSave(data)}>
                        Save Version
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumeEditor;

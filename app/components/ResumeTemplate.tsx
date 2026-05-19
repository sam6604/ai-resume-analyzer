import { cn } from "~/lib/utils";

interface ResumeTemplateProps {
    data: ResumeData;
}

const ResumeTemplate = ({ data }: ResumeTemplateProps) => {
    return (
        <div id="resume-template" className="bg-white p-12 text-slate-900 font-sans max-w-[800px] mx-auto shadow-2xl print:shadow-none print:p-0">
            {/* Header */}
            <header className="border-b-2 border-indigo-600 pb-6 mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase mb-2">{data.personalInfo.fullName}</h1>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-slate-600">
                        {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                        {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                        {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
                        {data.personalInfo.website && <span>{data.personalInfo.website}</span>}
                    </div>
                </div>
            </header>

            {/* Summary */}
            {data.personalInfo.summary && (
                <section className="mb-8">
                    <h2 className="text-sm font-black uppercase tracking-widest text-indigo-600 mb-3">Professional Summary</h2>
                    <p className="text-slate-700 leading-relaxed text-sm">{data.personalInfo.summary}</p>
                </section>
            )}

            {/* Experience */}
            <section className="mb-8">
                <h2 className="text-sm font-black uppercase tracking-widest text-indigo-600 mb-4">Work Experience</h2>
                <div className="flex flex-col gap-6">
                    {data.experience.map((exp) => (
                        <div key={exp.id}>
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-base text-slate-900">{exp.position}</h3>
                                <span className="text-xs font-bold text-slate-500 uppercase">{exp.startDate} — {exp.endDate}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-indigo-600">{exp.company}</span>
                                <span className="text-xs font-medium text-slate-400">{exp.location}</span>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Education */}
            <section className="mb-8">
                <h2 className="text-sm font-black uppercase tracking-widest text-indigo-600 mb-4">Education</h2>
                <div className="flex flex-col gap-4">
                    {data.education.map((edu) => (
                        <div key={edu.id} className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900">{edu.school}</h3>
                                <p className="text-sm text-slate-600">{edu.degree} in {edu.field}</p>
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase">{edu.startDate} — {edu.endDate}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Skills */}
            <section>
                <h2 className="text-sm font-black uppercase tracking-widest text-indigo-600 mb-3">Technical Skills</h2>
                <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill, index) => (
                        <span key={index} className="bg-slate-100 text-slate-700 px-3 py-1 rounded text-xs font-bold">
                            {skill}
                        </span>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ResumeTemplate;

import { useEffect, useState } from "react";

const Intro = ({ onFinish }: { onFinish: () => void }) => {
    const [step, setStep] = useState<'logo' | 'content'>('logo');
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const logoTimer = setTimeout(() => {
            setStep('content');
        }, 2500);
        return () => clearTimeout(logoTimer);
    }, []);

    const handleFinish = () => {
        setIsVisible(false);
        setTimeout(onFinish, 500); // Wait for fade out animation
    };

    return (
        <div className={`fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center overflow-hidden transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Logo Animation Step */}
            {step === 'logo' && (
                <div className="flex flex-col items-center gap-6 animate-in fade-in duration-1000">
                    <div className="size-24 bg-indigo-600 rounded-2xl flex items-center justify-center animate-bounce shadow-2xl shadow-indigo-500/40">
                        <span className="text-white font-black text-5xl">R</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 animate-in slide-in-from-bottom-4 duration-1000 delay-500">
                        RESUM<span className="text-indigo-600">IND</span>
                    </h1>
                </div>
            )}

            {/* Intro Content Step */}
            {step === 'content' && (
                <div className="flex flex-col items-center text-center max-w-4xl px-6 animate-in fade-in zoom-in-95 duration-1000">
                     <div className="size-16 bg-indigo-600 rounded-xl flex items-center justify-center mb-8 shadow-xl">
                        <span className="text-white font-bold text-2xl">R</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
                        Elevate Your <span className="text-indigo-600">Resume</span> <br/> with AI Precision
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 font-medium mb-12 max-w-2xl leading-relaxed">
                        The smart way to get professional ATS feedback, optimize for specific roles, and land your dream job faster.
                    </p>
                    <button 
                        onClick={handleFinish}
                        className="primary-button text-xl px-12 py-5 shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        Start Your Journey
                    </button>
                    
                    {/* Background Decorative Elements */}
                    <div className="absolute -top-[10%] -left-[10%] size-[600px] bg-indigo-500/10 blur-[120px] rounded-full -z-10" />
                    <div className="absolute -bottom-[10%] -right-[10%] size-[600px] bg-sky-500/10 blur-[120px] rounded-full -z-10" />
                </div>
            )}
        </div>
    );
};

export default Intro;

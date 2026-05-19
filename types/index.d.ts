<<<<<<< Updated upstream
=======
interface ResumeData {
    personalInfo: {
        fullName: string;
        email: string;
        phone: string;
        location: string;
        website?: string;
        summary: string;
    };
    experience: {
        id: string;
        company: string;
        position: string;
        location: string;
        startDate: string;
        endDate: string;
        description: string;
    }[];
    education: {
        id: string;
        school: string;
        degree: string;
        field: string;
        startDate: string;
        endDate: string;
    }[];
    skills: string[];
}

>>>>>>> Stashed changes
interface Resume {
    id: string;
    companyName?: string;
    jobTitle?: string;
    imagePath: string;
    resumePath: string;
    feedback: Feedback;
<<<<<<< Updated upstream
=======
    structuredData?: ResumeData;
}

interface JobRecommendation {
    title: string;
    company: string;
    location: string;
    description: string;
    link: string;
    matchScore: number; // 0-100
    matchReason: string; // Why this job matches the user's profile
>>>>>>> Stashed changes
}

interface Feedback {
    overallScore: number;
    ATS: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
        }[];
    };
    toneAndStyle: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    content: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    structure: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    skills: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
<<<<<<< Updated upstream
=======
    jobRecommendations?: JobRecommendation[];
>>>>>>> Stashed changes
}

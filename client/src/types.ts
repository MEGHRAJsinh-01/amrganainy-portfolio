export interface GitHubRepo {
    id: number;
    name: string;
    description: string | null;
    html_url: string;
    language: string | null;
    topics: string[];
    pushed_at: string;
    fork: boolean;
    private: boolean;
    stargazers_count: number;
    forks_count: number;
}

export interface CachedData {
    data: GitHubRepo[];
    timestamp: number;
}

export interface Project {
    id?: string;
    title: { en: string; de: string } | string;
    description: { en: string; de: string } | string;
    tags: string[] | string[];
    liveUrl: string;
    repoUrl: string;
    lastUpdated?: string;
    stars?: number;
    forks?: number;
    isFeatured?: boolean;
    videoUrl?: string;
    imageUrl?: string;
    technologies?: string[];
    featured?: boolean;
    order?: number;
    githubUrl?: string;
}

// Database Portfolio Interface
export interface Portfolio {
    profileImage?: string;
    cvViewUrl?: string;
    cvDownloadUrl?: string;
    personalInfo?: {
        name?: string;
        title?: string;
        email?: string;
        phone?: string;
        location?: string;
        bio?: string;
    };
    socialLinks?: {
        github?: string;
        linkedin?: string;
        twitter?: string;
    };
    lastUpdated?: Date | string;
}

export interface FormTranslation {
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    subject: string;
    subjectPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    submit: string;
    sending?: string;
    successMessage?: string;
    errorMessage?: string;
    validationError?: string;
}

export interface LanguageTranslation {
    nav: {
        about: string;
        projects: string;
        contact: string;
        cv: string;
    };
    about: {
        title: string;
        bio?: string;            // Now optional since it comes from LinkedIn
        education: string;
        experience?: string;     // Added for work experience section
        master?: string;         // Now optional since it comes from LinkedIn 
        bachelor?: string;       // Now optional since it comes from LinkedIn
        languages: string;
        german?: string;         // Now optional since it comes from LinkedIn
        english?: string;        // Now optional since it comes from LinkedIn
        programmingLanguages: string;
        skills: string;
        cv: string;
        viewCV: string;
        downloadCV: string;
    };
    projects: {
        title: string;
        subtitle: string;
    };
    contact: {
        title: string;
        subtitle: string;
        form: FormTranslation;
    };
    footer: {
        copyright: string;
    };
}

export interface Translations {
    en: LanguageTranslation;
    de: LanguageTranslation;
}

// LinkedIn Profile Data Interfaces
export interface LinkedInSkill {
    name?: string;
}

export interface LinkedInExperience {
    title?: string;
    company?: string;
    companyName?: string;
    description?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
}

export interface LinkedInEducation {
    school?: string;
    schoolName?: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
}

// Language Proficiency Interface
export interface LanguageProficiency {
    language: string;
    proficiency?: string;
    name?: string;
    code?: string;
    level?: string;
    certificate?: string;
}

export interface LinkedInProfileData {
    name?: string;
    headline?: string;
    summary?: string;
    about?: string;
    description?: string;
    bio?: string;
    location?: string;
    experiences?: LinkedInExperience[];
    education?: LinkedInEducation[];
    skills?: LinkedInSkill[];
    languages?: LanguageProficiency[];
    public_identifier?: string;
    profile_pic_url?: string;
    background_cover_image_url?: string;
}

export interface LinkedInAdditionalProfileData {
    fullName?: string;
    headline?: string;
    summary?: string;
    about?: string;
    geoLocationName?: string;
    skills?: (LinkedInSkill | string)[];
    experiences?: LinkedInExperience[];
    education?: LinkedInEducation[];
    certifications?: {
        name?: string;
        issuer?: string;
        issueDate?: string;
    }[];
    recommendations?: any[];
}

export interface LinkedInCacheData {
    profileData: LinkedInProfileData;
    timestamp: number;
}

export interface LinkedInAdditionalCacheData {
    additionalProfileData: LinkedInAdditionalProfileData;
    timestamp: number;
}

// Auth Types
export interface User {
    id: string;
    username: string;
    isAdmin: boolean;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface IProfile {
    id: string;
    userId: string;
    name: string;
    title: string;
    bio: string;
    about: string;
    contactEmail: string;
    phone?: string;
    location?: string;
    skills: string[];
    socialLinks: {
        github?: string;
        linkedin?: string;
        twitter?: string;
        website?: string;
        [key: string]: string | undefined;
    };
    profileImage?: string;
    profileImageUrl?: string;
    cvFile?: string;
    cvFileUrl?: string;
    cvViewUrl?: string;
    cvDownloadUrl?: string;
    languages?: string[];
    theme?: string;
    isPublic: boolean;
    customDomain?: string;
}

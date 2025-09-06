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
    title: { en: string; de: string };
    description: { en: string; de: string };
    tags: string[];
    liveUrl: string;
    repoUrl: string;
    lastUpdated: string;
    stars: number;
    forks: number;
    isFeatured?: boolean;
    videoUrl?: string;
    imageUrl?: string;
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
    };
    about: {
        title: string;
        bio: string;
        education: string;
        master: string;
        bachelor: string;
        languages: string;
        german: string;
        english: string;
        programmingLanguages: string;
        skills: string;
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

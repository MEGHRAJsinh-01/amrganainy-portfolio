import { Translations } from './types';

// --- Translations ---
export const translations: Translations = {
    en: {
        nav: {
            about: "About",
            projects: "Projects",
            contact: "Contact",
            cv: "CV"
        },
        about: {
            title: "", // This is a placeholder - actual title should come from LinkedIn headline
            education: "Education:",
            experience: "Experience:",
            languages: "Languages:",
            programmingLanguages: "Programming Languages",
            skills: "My Skills",
            cv: "My CV",
            viewCV: "View CV",
            downloadCV: "Download CV"
        },
        projects: {
            title: "Projects",
            subtitle: "A collection of my work, from mobile apps to open-source libraries."
        },
        contact: {
            title: "Get in Touch",
            subtitle: "I'm always open to discussing new projects, creative ideas, or opportunities. Feel free to reach out, and I'll get back to you as soon as possible.",
            form: {
                name: "Your Name",
                namePlaceholder: "Enter your name",
                email: "Your Email",
                emailPlaceholder: "Enter your email address",
                subject: "Subject",
                subjectPlaceholder: "What's this about?",
                message: "Your Message",
                messagePlaceholder: "Let me know how I can help.",
                submit: "Send Message",
                sending: "Sending...",
                successMessage: "Thank you! Your message has been sent successfully.",
                errorMessage: "Sorry, there was an error sending your message. Please try again.",
                validationError: "Please fill in all required fields"
            }
        },
        footer: {
            copyright: "© {year} {name}. All Rights Reserved."
        }
    },
    de: {
        nav: {
            about: "Über mich",
            projects: "Projekte",
            contact: "Kontakt",
            cv: "Lebenslauf"
        },
        about: {
            title: "", // This is a placeholder - actual title should come from LinkedIn headline
            education: "Ausbildung:",
            experience: "Berufserfahrung:",
            languages: "Sprachen:",
            programmingLanguages: "Programmiersprachen",
            skills: "Meine Fähigkeiten",
            cv: "Mein Lebenslauf",
            viewCV: "Lebenslauf anzeigen",
            downloadCV: "Lebenslauf herunterladen"
        },
        projects: {
            title: "Projekte",
            subtitle: "Eine Sammlung meiner Arbeiten von mobilen Apps bis hin zu Open-Source-Bibliotheken."
        },
        contact: {
            title: "Kontakt",
            subtitle: "Ich bin immer offen für neue Projekte, kreative Ideen oder Möglichkeiten. Melden Sie sich gerne bei mir, ich antworte so schnell wie möglich.",
            form: {
                name: "Ihr Name",
                namePlaceholder: "Geben Sie Ihren Namen ein",
                email: "Ihre E-Mail",
                emailPlaceholder: "Geben Sie Ihre E-Mail-Adresse ein",
                subject: "Betreff",
                subjectPlaceholder: "Worum geht es?",
                message: "Ihre Nachricht",
                messagePlaceholder: "Lassen Sie mich wissen, wie ich helfen können.",
                submit: "Nachricht senden",
                sending: "Senden...",
                successMessage: "Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.",
                errorMessage: "Entschuldigung, beim Senden Ihrer Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
                validationError: "Bitte füllen Sie alle erforderlichen Felder aus"
            }
        },
        footer: {
            copyright: "© {year} {name}. Alle Rechte vorbehalten."
        }
    }
};

// --- Data ---
// EMERGENCY FALLBACK VALUES - These should only be used if API data completely fails to load
// These values should never be used directly - always prefer data from LinkedIn API
export const personalInfo = {
    name: "",
    title: "",
    imageUrl: import.meta.env.VITE_PROFILE_IMAGE_URL || "", // Only used if no LinkedIn or portfolio image
    // CV URLs loaded from environment variables (fallback)
    cvUrl: import.meta.env.VITE_CV_VIEW_URL || "",
    cvPdfUrl: import.meta.env.VITE_CV_DOWNLOAD_URL || "",
    contact: {
        email: "",
        linkedin: import.meta.env.VITE_LINKEDIN_URL, // Only used to fetch LinkedIn data
        github: import.meta.env.VITE_GITHUB_URL, // Only used to fetch GitHub data
        phone: "",
        address: ""
    }
};

// --- Constants ---
export const GITHUB_USERNAME = import.meta.env.VITE_GITHUB_USERNAME;
export const CACHE_KEY = import.meta.env.VITE_CACHE_KEY;
export const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD; // Fallback for development
export const VISIBILITY_KEY = 'project_visibility_settings';

// API URL configuration
export const LOCAL_API_URL = 'http://localhost:3000/api';
export const CLOUD_API_URL = 'https://amrganainy-portfolio-api.onrender.com/api';

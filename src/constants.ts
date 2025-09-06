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
            title: "CS Graduate & Cyber Security Master Student",
            education: "Education:",
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
            title: "CS Graduate & Cyber Security Master Student",
            education: "Ausbildung:",
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
// Default values that will be overridden by API data when loaded
export const personalInfo = {
    name: "Amr Elganainy",
    title: "CS Graduate & Cyber Security Master Student",
    imageUrl: import.meta.env.VITE_PROFILE_IMAGE_URL || "", // Default fallback
    // CV URLs loaded from environment variables (fallback)
    cvUrl: import.meta.env.VITE_CV_VIEW_URL || "",
    cvPdfUrl: import.meta.env.VITE_CV_DOWNLOAD_URL || "",
    contact: {
        email: "amrmohammedali11@gmail.com",
        linkedin: "https://www.linkedin.com/in/amr-elganainy/",
        github: "https://github.com/ganainy",
        phone: "017 641 733 956",
        address: "44143, Dortmund"
    }
};

// Featured repositories that should be treated as manual projects
export const FEATURED_REPOS = [
    'appium-traverser',
    'captive-portal-analyzer-kotlin',
    'raspberrypi-captive-portal',
    'job-app-assistant',
    'Our_chat',
    'gym_masters_kotlin_compose',
    'realtime_quizzes',
    'Reminderly'
];

// --- Constants ---
export const GITHUB_USERNAME = 'ganainy';
export const CACHE_KEY = 'github_projects_cache';
export const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'; // Fallback for development
export const VISIBILITY_KEY = 'project_visibility_settings';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

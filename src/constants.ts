import { Translations } from './types';

// --- Translations ---
export const translations: Translations = {
    en: {
        nav: {
            about: "About",
            projects: "Projects",
            contact: "Contact"
        },
        about: {
            title: "CS Graduate & Cyber Security Master Student",
            bio: "Junior Android and cross-platform mobile developer with solid project experience. I love turning ideas into functional apps, am a team player, and always ready to learn. As a CS graduate and Cyber Security master's student, I'm currently writing my master's thesis.",
            education: "Education:",
            master: "Master in Internet Security, Westfälische Hochschule (2022 - present, Grade: 2.2)",
            bachelor: "Bachelor in Computer Science, Mansoura University, Egypt (2015 - 2019, Grade: 2.3)",
            languages: "Languages:",
            german: "German: C1 Telc University Certificate",
            english: "English: B2",
            skills: "My Skills"
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
                submit: "Send Message"
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
            contact: "Kontakt"
        },
        about: {
            title: "CS Graduate & Cyber Security Master Student",
            bio: "Junior Android- und cross-platform Mobile-Entwickler mit fundierter Projekterfahrung. Ich liebe es, Ideen in funktionierende Apps umzusetzen, bin Teamplayer und immer bereit, mehr zu lernen. Als CS-Absolvent und Master-Student in Cyber Security schreibe ich derzeit meine Masterarbeit.",
            education: "Ausbildung:",
            master: "Master in Internet-Sicherheit, Westfälische Hochschule (2022 - heute, Note: 2,2)",
            bachelor: "Bachelor in Informatik, Mansoura Universität, Ägypten (2015 - 2019, Note: 2,3)",
            languages: "Sprachen:",
            german: "Deutsch: C1 Telc Hochschulzertifikat",
            english: "Englisch: B2",
            skills: "Meine Fähigkeiten"
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
                submit: "Nachricht senden"
            }
        },
        footer: {
            copyright: "© {year} {name}. Alle Rechte vorbehalten."
        }
    }
};

// --- Data ---
export const personalInfo = {
    name: "Amr Elganainy",
    title: "CS Graduate & Cyber Security Master Student",
    bio: {
        en: "Junior Android and cross-platform mobile developer with solid project experience. I love turning ideas into functional apps, am a team player, and always ready to learn. As a CS graduate and Cyber Security master's student, I'm currently writing my master's thesis.",
        de: "Junior Android- und cross-platform Mobile-Entwickler mit fundierter Projekterfahrung. Ich liebe es, Ideen in funktionierende Apps umzusetzen, bin Teamplayer und immer bereit, mehr zu lernen. Als CS-Absolvent und Master-Student in Cyber Security schreibe ich derzeit meine Masterarbeit."
    },
    imageUrl: "photos/profile-pic.png",
    contact: {
        email: "amrmohammedali11@gmail.com",
        linkedin: "https://www.linkedin.com/in/amr-elganainy/",
        github: "https://github.com/ganainy",
        phone: "017 641 733 956",
        address: "44143, Dortmund"
    }
};

export const skills = [
    'Java', 'Kotlin', 'Dart', 'Python',
    'Restful APIs', 'Firebase Services', 'Jetpack', 'MVVM', 'XML', 'Kotlin Compose',
    'Coroutines', 'Database', 'Work Manager', 'Play Console', 'Social SDKs', 'Adaptive UI',
    'Android Studio', 'Visual Studio Code', 'Git', 'GitHub', 'Linux',
    'AI/ML', 'Appium', 'Security Analysis', 'Privacy Evaluation'
];

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

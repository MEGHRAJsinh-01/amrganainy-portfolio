import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// --- Data ---
const personalInfo = {
    name: "Ethan Carter",
    title: "CS Graduate & Mobile Developer",
    bio: "I'm a Computer Science graduate specializing in mobile and cross-platform development. Currently pursuing my Master's degree at Westfälische Hochschule, I'm passionate about creating innovative solutions that bridge the gap between different platforms. My expertise spans mobile app development, cross-platform frameworks, and modern development practices.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXD1WNCIvKSjjwmI3XwjmnRykuG-8APdjdvUX5rS5SELIPFiYskpt8Hex3BVdyErefpiGYn_Mq9eDn5c7HbWggNge4OQSD0yOe3GYSXoMYQ3fx3_5kPuYWkWODzRUJtdGmO-KoFpnRP0l0IqEfA5OEiT6SN8l5YoVzq-yScRVfck1Mz_K4OLRlJ9A2kFlaCHEMwUTgrjIF8s_YRLdSuEbRbKs-SWQfY5-C9zWNckaLpYi2PISgXQ_6bnyg7PWn-MGsrynekL2eovU",
    contact: {
        email: "ethan.carter@example.com",
        linkedin: "https://linkedin.com/in/ethancarter",
        github: "https://github.com/ethancarter",
    }
};

const skills = [
    'Swift', 'Kotlin', 'React Native', 'Java', 'C++',
    'UI/UX Design', 'Agile Development', 'Version Control (Git)',
    'Problem Solving', 'Communication'
];

const projects = [
    {
        title: "Captive Portal Analyzer",
        description: "A command-line tool to detect and analyze captive portals, helping users understand network restrictions.",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-yVuwmuxIF12I6O02TY_aMrG6FjXk3uCHte6U2F4ToC-B3yr3h_0T39NJCt9byr8AhxslfXEBKXEMMv-b3SMDtlNv58td0nuuiEzBi8vm_6PPcLKNz3APCYU_E8OxaHYk9yC1ggkBXz-pRDmpq-34hQYrP9H8tbEY_xEtCP866yef-WyLNr-gqwQtxDfaYWEEsTg91lNcMBOYFJuncGsr62lHhsCZUaf3yjv_F7Myw-H7e89etxicH-Ca85U0QlBvOmm9z0At0jw",
        tags: ["Python", "Cybersecurity"],
        liveUrl: "#",
        repoUrl: "#"
    },
    {
        title: "Appium Traverser",
        description: "A testing utility that automates UI traversal for Android and iOS apps using Appium, simplifying test creation.",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgxrNIwSkndfgMEiJBWF-yn79CAXuzOvQeT1fPLg6wtw40uVCb1j0H0IMjNJUNgi2K3j9bi4C-YdeBS101YrJpaKad4CBM8C3daQEAb3_VnZXEx83tqIVqpauepUne7nNm5Gp7qJl4ztu7mMOCHj-RF9rZRvMNN3SVKj3xmbboaSf0SjAziuxdRgiLu9sVU1oKMOeTaD6pu55sjoUrx7edaIBdj56-wSChmtCtdc5cRWqbcMBiQlmn5V0CgvQqzQ9VYVRL8IRuCtU",
        tags: ["Java", "Mobile Testing", "Android", "iOS"],
        liveUrl: "#",
        repoUrl: "#"
    },
    {
        title: "Job Application Assistant",
        description: "An AI-powered tool that assists with filling out job applications by parsing and autofilling information from a user's profile.",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqU32_oJ0JXcyhz-pPsNVqXemEVshc4MeoPrWgJ5uwQyaVDWOSSeuv-gTHhZwngCIfyPGVjaEYkVu7U77zSUkNBEKmTPFWxLckpXI3hnIAIkzk1ihB5K80P9AUhmZuBo-ZO3VbrukX6m2IBgraWYPzE2b1YiyMF8-VimqA1k_Ct_9jsdD6c-v4TExegSuRKd5qSyzLHCisqRbGoWgwlnz6Hh0elLs054oqc6zWmLodahZ03xh741fM_jNT-VP0_RtaEgs1nTcEmrU",
        tags: ["Python", "AI", "ML"],
        liveUrl: "#",
        repoUrl: "#"
    },
    {
        title: "FoodyApp",
        description: "A cross-platform mobile app for discovering and ordering food from local restaurants.",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbdJsCmoilOYZr6D5yB4l-bDj9c0Vkak3T6a0s9q93GbC5FdPgMVrvGAqnDFD1pP0ofLD06y9WjB2rdkMT72O7VdSmpdV1_C7WiYnUnbBCl1TEel2bGFmWx4FalhYQ0uTRDy0Cd_zZRsmNwBSBp5JnC9n7c6jVdkrEJE1KbxsCsx7CRPv4N54pRCjvqb2m6rhoQ_7nAoiigdPtW9gtemgGc52Td9XMLxN-0tbV0vUoAagVwSQg_tZNBmDVdIlMXJ_HFfXqAEn1hRo",
        tags: ["React Native", "JavaScript", "Node.js"],
        liveUrl: "#",
        repoUrl: "#"
    },
    {
        title: "Gym Masters",
        description: "A native Android app for gym enthusiasts to track workouts, create custom routines, and view exercise tutorials.",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbdJsCmoilOYZr6D5yB4l-bDj9c0Vkak3T6a0s9q93GbC5FdPgMVrvGAqnDFD1pP0ofLD06y9WjB2rdkMT72O7VdSmpdV1_C7WiYnUnbBCl1TEel2bGFmWx4FalhYQ0uTRDy0Cd_zZRsmNwBSBp5JnC9n7c6jVdkrEJE1KbxsCsx7CRPv4N54pRCjvqb2m6rhoQ_7nAoiigdPtW9gtemgGc52Td9XMLxN-0tbV0vUoAagVwSQg_tZNBmDVdIlMXJ_HFfXqAEn1hRo",
        tags: ["Kotlin", "Android", "SQLite"],
        liveUrl: "#",
        repoUrl: "#"
    },
     {
        title: "Reminderly",
        description: "A simple and intuitive cross-platform reminder app built with Flutter.",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbdJsCmoilOYZr6D5yB4l-bDj9c0Vkak3T6a0s9q93GbC5FdPgMVrvGAqnDFD1pP0ofLD06y9WjB2rdkMT72O7VdSmpdV1_C7WiYnUnbBCl1TEel2bGFmWx4FalhYQ0uTRDy0Cd_zZRsmNwBSBp5JnC9n7c6jVdkrEJE1KbxsCsx7CRPv4N54pRCjvqb2m6rhoQ_7nAoiigdPtW9gtemgGc52Td9XMLxN-0tbV0vUoAagVwSQg_tZNBmDVdIlMXJ_HFfXqAEn1hRo",
        tags: ["Flutter", "Dart", "Firebase"],
        liveUrl: "#",
        repoUrl: "#"
    },
];

// --- Components ---

const Header = () => (
    <header className="header">
        <nav className="container">
            <a href="#" className="logo">{personalInfo.name}</a>
            <ul>
                <li><a href="#about">About</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
);

const About = () => (
    <section id="about" className="section-container about-section">
        <div className="about-content">
            <div className="about-image" style={{ backgroundImage: `url("${personalInfo.imageUrl}")` }} aria-label={`Portrait of ${personalInfo.name}`}></div>
            <div className="about-text">
                <h1>{personalInfo.name}</h1>
                <h2>{personalInfo.title}</h2>
                <p>{personalInfo.bio}</p>
            </div>
        </div>
        <div className="skills-content">
            <h3>My Skillset</h3>
            <div className="skills-grid">
                {skills.map(skill => (
                    <div key={skill} className="skill-tag">{skill}</div>
                ))}
            </div>
        </div>
    </section>
);

const ProjectCard = ({ project }) => {
    const { title, description, imageUrl, tags, liveUrl, repoUrl } = project;
    return (
        <div className="project-card">
            <div className="project-image" style={{ backgroundImage: `url("${imageUrl}")` }}></div>
            <div className="project-content">
                <h3>{title}</h3>
                <p>{description}</p>
                <div className="project-tags">
                    {tags.map(tag => (
                        <span key={tag} className={`tag tag-${tag.toLowerCase().replace(/[\s\.]+/g, '-')}`}>{tag}</span>
                    ))}
                </div>
                <div className="project-links">
                    <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                        <span className="material-symbols-outlined">link</span>
                        Live Demo
                    </a>
                    <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                        <span className="material-symbols-outlined">code</span>
                        Repository
                    </a>
                </div>
            </div>
        </div>
    );
};

const Projects = () => (
    <section id="projects" className="section-container">
        <div className="section-header">
            <h2>Projects Showcase</h2>
            <p>A collection of my work, from mobile apps to open-source libraries.</p>
        </div>
        <div className="projects-grid">
            {projects.map(project => (
                <ProjectCard key={project.title} project={project} />
            ))}
        </div>
    </section>
);


const Contact = () => (
    <section id="contact" className="section-container">
        <div className="section-header">
            <h2>Get in Touch</h2>
        </div>
        <div className="contact-grid">
            <div className="contact-info">
                <p>I'm always open to discussing new projects, creative ideas, or opportunities. Feel free to reach out, and I'll get back to you as soon as possible.</p>
                <div className="contact-links">
                    <a href={`mailto:${personalInfo.contact.email}`}>
                        <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        <span>{personalInfo.contact.email}</span>
                    </a>
                    <a href={personalInfo.contact.linkedin} target="_blank" rel="noopener noreferrer">
                       <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px"><path d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm0,192H40V40H216V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z"></path></svg>
                        <span>linkedin.com/in/ethancarter</span>
                    </a>
                    <a href={personalInfo.contact.github} target="_blank" rel="noopener noreferrer">
                        <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px"><path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z"></path></svg>
                        <span>GitHub</span>
                    </a>
                </div>
            </div>
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                <label><span>Your Name</span><input type="text" placeholder="Enter your name" /></label>
                <label><span>Your Email</span><input type="email" placeholder="Enter your email address" /></label>
                <label><span>Subject</span><input type="text" placeholder="What's this about?" /></label>
                <label><span>Your Message</span><textarea placeholder="Let me know how I can help." rows={5}></textarea></label>
                <button type="submit">Send Message</button>
            </form>
        </div>
    </section>
);


const Footer = () => (
    <footer>
        <p>&copy; {new Date().getFullYear()} {personalInfo.name}. All Rights Reserved.</p>
    </footer>
);

const App = () => (
    <>
        <Header />
        <main>
            <About />
            <Projects />
            <Contact />
        </main>
        <Footer />
    </>
);

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);

root.render(
    <StrictMode>
        <App />
    </StrictMode>
);
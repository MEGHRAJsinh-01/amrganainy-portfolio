import React from 'react';
import { translations, personalInfo } from '../constants';

interface ContactProps {
    language: string;
}

const Contact: React.FC<ContactProps> = ({ language }) => (
    <section id="contact" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tighter mb-4">{translations[language].contact.title}</h2>
                <p className="max-w-2xl mx-auto text-lg text-gray-400">{translations[language].contact.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 group">
                            <svg className="text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            <a className="text-lg text-gray-300 hover:text-blue-400 transition-colors" href={`tel:${personalInfo.contact.phone}`}>{personalInfo.contact.phone}</a>
                        </div>
                        <div className="flex items-center gap-3 group">
                            <svg className="text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            <a className="text-lg text-gray-300 hover:text-blue-400 transition-colors" href={`mailto:${personalInfo.contact.email}`}>{personalInfo.contact.email}</a>
                        </div>
                        <div className="flex items-center gap-3 group">
                            <svg className="text-gray-400 group-hover:text-blue-400 transition-colors" fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px"><path d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm0,192H40V40H216V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z"></path></svg>
                            <a className="text-lg text-gray-300 hover:text-blue-400 transition-colors" href={personalInfo.contact.linkedin} target="_blank" rel="noopener noreferrer">linkedin.com/in/amr-elganainy</a>
                        </div>
                        <div className="flex items-center gap-3 group">
                            <svg className="text-gray-400 group-hover:text-blue-400 transition-colors" fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px"><path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z"></path></svg>
                            <a className="text-lg text-gray-300 hover:text-blue-400 transition-colors" href={personalInfo.contact.github} target="_blank" rel="noopener noreferrer">GitHub</a>
                        </div>
                        <div className="flex items-center gap-3 group">
                            <svg className="text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            <span className="text-lg text-gray-300">{personalInfo.contact.address}</span>
                        </div>
                    </div>
                </div>
                <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-300">{translations[language].contact.form.name}</span>
                        <input className="w-full rounded-md bg-gray-800 border border-gray-700 text-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 px-4" type="text" placeholder={translations[language].contact.form.namePlaceholder} />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-300">{translations[language].contact.form.email}</span>
                        <input className="w-full rounded-md bg-gray-800 border border-gray-700 text-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 px-4" type="email" placeholder={translations[language].contact.form.emailPlaceholder} />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-300">{translations[language].contact.form.subject}</span>
                        <input className="w-full rounded-md bg-gray-800 border border-gray-700 text-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 px-4" type="text" placeholder={translations[language].contact.form.subjectPlaceholder} />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-300">{translations[language].contact.form.message}</span>
                        <textarea className="w-full rounded-md bg-gray-800 border border-gray-700 text-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-36 p-4" placeholder={translations[language].contact.form.messagePlaceholder} rows={5}></textarea>
                    </label>
                    <button className="flex items-center justify-center rounded-md h-12 px-6 bg-blue-600 text-white text-base font-bold hover:bg-blue-700 transition-all w-full lg:w-auto" type="submit">
                        <span>{translations[language].contact.form.submit}</span>
                    </button>
                </form>
            </div>
        </div>
    </section>
);

export default Contact;

import React from 'react';

interface ContactSectionProps {
    contactEmail: string;
    setContactEmail: (email: string) => void;
    handleContactEmailUpdate: () => void;
    contactUpdateMessage: { text: string; type: string };
    showContactSection: boolean;
    setShowContactSection: (show: boolean) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
    contactEmail,
    setContactEmail,
    handleContactEmailUpdate,
    contactUpdateMessage,
    showContactSection,
    setShowContactSection
}) => {
    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Contact Email Management</h2>
                <button
                    onClick={() => setShowContactSection(!showContactSection)}
                    className="text-blue-400 hover:text-blue-300"
                >
                    {showContactSection ? 'Hide' : 'Show'} Section
                </button>
            </div>

            {showContactSection && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
                    <p className="text-gray-400 mb-4">
                        Update your contact email. This email is used for the contact form and displayed in your portfolio.
                    </p>

                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Contact Email Address
                        </label>
                        <input
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                            placeholder="your@email.com"
                        />
                    </div>

                    <button
                        onClick={handleContactEmailUpdate}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                        Update Contact Email
                    </button>

                    {contactUpdateMessage.text && (
                        <div className={`mt-4 p-4 rounded-md ${contactUpdateMessage.type === 'error' ? 'bg-red-900/20 border border-red-500/50 text-red-300' : 'bg-blue-900/20 border border-blue-500/50 text-blue-300'}`}>
                            {contactUpdateMessage.text}
                        </div>
                    )}

                    <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/50 rounded-md">
                        <p className="text-yellow-400 text-sm">
                            <strong>Note:</strong> This email address is stored in the database and is used for the contact form.
                            Changes will be immediate once you click the "Update Contact Email" button.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

interface SocialSectionProps {
    githubUrl: string;
    setGithubUrl: (url: string) => void;
    linkedinUrl: string;
    setLinkedinUrl: (url: string) => void;
    handleSocialLinksUpdate: () => void;
    socialUpdateMessage: { text: string; type: string };
    showSocialSection: boolean;
    setShowSocialSection: (show: boolean) => void;
}

export const SocialSection: React.FC<SocialSectionProps> = ({
    githubUrl,
    setGithubUrl,
    linkedinUrl,
    setLinkedinUrl,
    handleSocialLinksUpdate,
    socialUpdateMessage,
    showSocialSection,
    setShowSocialSection
}) => {
    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Social Links Management</h2>
                <button
                    onClick={() => setShowSocialSection(!showSocialSection)}
                    className="text-blue-400 hover:text-blue-300"
                >
                    {showSocialSection ? 'Hide' : 'Show'} Section
                </button>
            </div>

            {showSocialSection && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
                    <p className="text-gray-400 mb-4">
                        Update your social media links. These links are displayed in your portfolio.
                    </p>

                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            GitHub URL
                        </label>
                        <input
                            type="url"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                            placeholder="https://github.com/yourusername"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            LinkedIn URL
                        </label>
                        <input
                            type="url"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                            placeholder="https://linkedin.com/in/yourusername"
                        />
                    </div>

                    <button
                        onClick={handleSocialLinksUpdate}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                        Update Social Links
                    </button>

                    {socialUpdateMessage.text && (
                        <div className={`mt-4 p-4 rounded-md ${socialUpdateMessage.type === 'error' ? 'bg-red-900/20 border border-red-500/50 text-red-300' : 'bg-blue-900/20 border border-blue-500/50 text-blue-300'}`}>
                            {socialUpdateMessage.text}
                        </div>
                    )}

                    <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/50 rounded-md">
                        <p className="text-yellow-400 text-sm">
                            <strong>Note:</strong> These social links are stored in the database and are displayed in your portfolio.
                            Changes will be immediate once you click the "Update Social Links" button.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

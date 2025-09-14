import { Portfolio, Project } from './types';
import { CLOUD_API_URL, LOCAL_API_URL } from './constants';

// In production, ensure we always use the cloud API
const isProd = import.meta.env.MODE === 'production';
const API_URL = isProd ? CLOUD_API_URL : LOCAL_API_URL;

console.log('Using API URL:', API_URL);

// Detect if we're viewing a public portfolio at /u/:username
// Returns the username if present, otherwise null
const getPublicUsername = (): string | null => {
    try {
        const path = window.location?.pathname || '';
        // Supported patterns:
        // - /u/:username
        // - /u/:username/anything
        const match = path.match(/^\/?u\/([^\/?#]+)(?:[\/?#].*)?$/i);
        return match && match[1] ? decodeURIComponent(match[1]) : null;
    } catch {
        return null;
    }
};

// Normalize various backend profile payloads into the legacy Portfolio shape
const normalizeProfile = (raw: any): Portfolio => {
    try {
        // New multi-user public shape: { status, data: { profile, user } }
        if (raw && raw.data && (raw.data.profile || raw.data.user)) {
            const p = raw.data.profile || {};
            const u = raw.data.user || {};
            const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ');
            return {
                profileImage: p.profileImageUrl || p.profileImage || '',
                cvViewUrl: p.cvViewUrl || p.cvFileUrl || p.cvDownloadUrl,
                cvDownloadUrl: p.cvDownloadUrl || p.cvFileUrl || p.cvViewUrl,
                personalInfo: {
                    name: fullName || u.username || '',
                    title: p.title || '',
                    email: p.contactEmail || '',
                    phone: p.phone || '',
                    location: p.location || '',
                    bio: p.bio || ''
                },
                socialLinks: p.socialLinks || {}
            };
        }

        // Legacy private shape examples (various): keep if already in expected format
        if (raw && (raw.personalInfo || raw.socialLinks || raw.profileImage)) {
            return raw as Portfolio;
        }

        // Older legacy flat profile: { name, title, bio, profileImage, cvFile, socialLinks, ... }
        if (raw && (raw.name || raw.title || raw.bio)) {
            return {
                profileImage: raw.profileImage || raw.profileImageUrl,
                cvViewUrl: raw.cvViewUrl || raw.cvFile || raw.cvDownloadUrl,
                cvDownloadUrl: raw.cvDownloadUrl || raw.cvFile,
                personalInfo: {
                    name: raw.name || '',
                    title: raw.title || '',
                    email: raw.contactEmail || '',
                    phone: raw.contactPhone || raw.phone || '',
                    location: raw.location || '',
                    bio: raw.bio || ''
                },
                socialLinks: raw.socialLinks || {}
            };
        }
    } catch (e) {
        console.warn('Failed to normalize profile payload, returning raw:', e);
    }
    return raw as Portfolio;
};

// Store token in localStorage
const setToken = (token: string) => {
    localStorage.setItem('portfolio_auth_token', token);
};

// Get token from localStorage
const getToken = (): string | null => {
    return localStorage.getItem('portfolio_auth_token');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    const token = getToken();
    if (!token) return false;

    try {
        // Basic JWT validation - check if token is not expired
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        return payload.exp > currentTime;
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
};

// Remove token from localStorage
const removeToken = () => {
    localStorage.removeItem('portfolio_auth_token');
};

// Auth headers for protected requests
const authHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

// Authentication API
export const authAPI = {
    login: async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            setToken(data.token);
            return data.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    register: async (userData: { username: string; email: string; password: string; linkedinUrl: string; githubUrl: string }) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            setToken(data.token);
            return data.user;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    logout: () => {
        removeToken();
    },

    isAuthenticated: () => {
        return !!getToken();
    }
};

// Portfolio API (aligned with multi-user backend routes)
export const portfolioAPI = {
    getProfile: async () => {
        try {
            const publicUsername = getPublicUsername();
            const url = publicUsername
                ? `${API_URL.replace(/\/api$/, '/api')}/profiles/username/${encodeURIComponent(publicUsername)}`
                : `${API_URL}/profile/me`;

            const response = await fetch(url, {
                headers: publicUsername ? { 'Content-Type': 'application/json' } : authHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch profile data');
            }

            const json = await response.json();
            return normalizeProfile(json);
        } catch (error) {
            console.error('Error fetching profile data:', error);
            throw error;
        }
    },

    createProfile: async (profileData: any) => {
        try {
            const response = await fetch(`${API_URL}/profile/me`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create profile');
            }

            const json = await response.json();
            return normalizeProfile(json);
        } catch (error) {
            console.error('Error creating profile:', error);
            throw error;
        }
    },

    updateProfile: async (profileData: any) => {
        try {
            const response = await fetch(`${API_URL}/profile/me`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            const json = await response.json();
            return normalizeProfile(json);
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },

    uploadProfileImage: async (imageFile: File) => {
        try {
            const formData = new FormData();
            // Server expects field name 'image' at /profile/me/profile-image
            formData.append('image', imageFile);

            const response = await fetch(`${API_URL}/profile/me/profile-image`, {
                method: 'POST',
                headers: {
                    'Authorization': authHeaders().Authorization,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload profile image');
            }

            const json = await response.json();
            // Return a simple shape for consumers
            const data = json?.data || {};
            return { profileImageUrl: data.profileImageUrl };
        } catch (error) {
            console.error('Error uploading profile image:', error);
            throw error;
        }
    },

    uploadCV: async (cvFile: File) => {
        try {
            const formData = new FormData();
            // Server expects field name 'cv' at /profile/me/cv
            formData.append('cv', cvFile);

            const response = await fetch(`${API_URL}/profile/me/cv`, {
                method: 'POST',
                headers: {
                    'Authorization': authHeaders().Authorization,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload CV');
            }

            const json = await response.json();
            const data = json?.data || {};
            // Return normalized Portfolio-like snippet
            return {
                cvFileUrl: data.cvFileUrl,
                cvViewUrl: data.cvViewUrl,
                cvDownloadUrl: data.cvDownloadUrl
            };
        } catch (error) {
            console.error('Error uploading CV:', error);
            throw error;
        }
    },

    deleteProfileImage: async () => {
        try {
            // No dedicated delete endpoint on server; clear via PATCH
            const response = await fetch(`${API_URL}/profile/me`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify({ profileImageUrl: '' })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to remove profile image');
            }

            const json = await response.json();
            return normalizeProfile(json);
        } catch (error) {
            console.error('Error deleting profile image:', error);
            throw error;
        }
    },

    translate: async (text: string, source: string, target: string) => {
        try {
            const response = await fetch(`${API_URL}/translate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, source, target }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Translation failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Error translating text:', error);
            throw error;
        }
    }
};

// Projects API
export const projectsAPI = {
    getProjects: async (): Promise<Project[]> => {
        try {
            const response = await fetch(`${API_URL}/projects`, {
                headers: authHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch projects');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching projects:', error);
            throw error;
        }
    },

    getProject: async (id: string): Promise<Project> => {
        try {
            const response = await fetch(`${API_URL}/projects/${id}`, {
                headers: authHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch project');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching project:', error);
            throw error;
        }
    },

    createProject: async (project: Partial<Project>): Promise<Project> => {
        try {
            const response = await fetch(`${API_URL}/projects`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(project),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create project');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    },

    updateProject: async (id: string, project: Partial<Project>): Promise<Project> => {
        try {
            const response = await fetch(`${API_URL}/projects/${id}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify(project),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update project');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating project:', error);
            throw error;
        }
    },

    deleteProject: async (id: string): Promise<void> => {
        try {
            const response = await fetch(`${API_URL}/projects/${id}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete project');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    },

    uploadProjectImage: async (projectId: string, imageFile: File) => {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch(`${API_URL}/projects/${projectId}/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': authHeaders().Authorization,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload project image');
            }

            return await response.json();
        } catch (error) {
            console.error('Error uploading project image:', error);
            throw error;
        }
    }
};

// LinkedIn API
export const linkedinAPI = {
    getLinkedInProfile: async (profileUrl: string) => {
        try {
            const response = await fetch(`${API_URL}/linkedin-profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileUrl }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch LinkedIn profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching LinkedIn profile:', error);
            throw error;
        }
    }
};

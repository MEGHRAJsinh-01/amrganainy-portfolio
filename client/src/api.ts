import { Portfolio, Project } from './types';
import { CLOUD_API_URL, LOCAL_API_URL } from './constants';

// In production, ensure we always use the cloud API
const isProd = import.meta.env.MODE === 'production';
const API_URL = isProd ? CLOUD_API_URL : LOCAL_API_URL;

console.log('Using API URL:', API_URL);

// Store token in localStorage
const setToken = (token: string) => {
    localStorage.setItem('portfolio_auth_token', token);
};

// Get token from localStorage
const getToken = (): string | null => {
    return localStorage.getItem('portfolio_auth_token');
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
    login: async (username: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
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

    logout: () => {
        removeToken();
    },

    isAuthenticated: () => {
        return !!getToken();
    }
};

// Portfolio API
export const portfolioAPI = {
    getPortfolio: async (): Promise<Portfolio> => {
        try {
            const response = await fetch(`${API_URL}/portfolio`);

            if (!response.ok) {
                throw new Error('Failed to fetch portfolio data');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching portfolio data:', error);
            throw error;
        }
    },

    updatePortfolio: async (portfolioData: Partial<Portfolio>): Promise<Portfolio> => {
        try {
            const response = await fetch(`${API_URL}/portfolio`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify(portfolioData),
            });

            if (!response.ok) {
                throw new Error('Failed to update portfolio data');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating portfolio data:', error);
            throw error;
        }
    },

    uploadProfileImage: async (imageFile: File): Promise<{ imageUrl: string }> => {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch(`${API_URL}/portfolio/profile-image`, {
                method: 'POST',
                headers: {
                    'Authorization': authHeaders().Authorization,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload profile image');
            }

            return await response.json();
        } catch (error) {
            console.error('Error uploading profile image:', error);
            throw error;
        }
    },

    deleteProfileImage: async (): Promise<void> => {
        try {
            const response = await fetch(`${API_URL}/portfolio/profile-image`, {
                method: 'DELETE',
                headers: authHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to delete profile image');
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting profile image:', error);
            throw error;
        }
    }
};

// Projects API
export const projectsAPI = {
    getProjects: async (): Promise<Project[]> => {
        try {
            const response = await fetch(`${API_URL}/projects`);

            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching projects:', error);
            throw error;
        }
    },

    getProject: async (id: string): Promise<Project> => {
        try {
            const response = await fetch(`${API_URL}/projects/${id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch project');
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
                throw new Error('Failed to create project');
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
                throw new Error('Failed to update project');
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
                throw new Error('Failed to delete project');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    },

    uploadProjectImage: async (imageFile: File): Promise<{ imageUrl: string }> => {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch(`${API_URL}/projects/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': authHeaders().Authorization,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload project image');
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

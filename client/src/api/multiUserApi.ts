import axios from 'axios';

// Create axios instance with base URL and default config
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true, // Include cookies in requests
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor to add authorization header with JWT
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const authAPI = {
    register: (userData) => apiClient.post('/auth/register', userData),
    login: (credentials) => apiClient.post('/auth/login', credentials),
    logout: () => apiClient.post('/auth/logout'),
    forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => apiClient.post(`/auth/reset-password/${token}`, { password }),
    verifyEmail: (token) => apiClient.get(`/auth/verify-email/${token}`),
    updatePassword: (passwordData) => apiClient.patch('/auth/update-password', passwordData),
    getCurrentUser: () => apiClient.get('/auth/me')
};

// Profiles API
export const profileAPI = {
    // Server route is '/profiles/id/:userId'
    getProfileByUserId: (userId) => apiClient.get(`/profiles/id/${userId}`),
    getProfileByUsername: (username) => apiClient.get(`/profiles/username/${username}`),
    getCurrentUserProfile: () => apiClient.get('/profile/me'),
    updateProfile: (profileData) => apiClient.patch('/profile/me', profileData),
    uploadProfileImage: (imageFile) => {
        const formData = new FormData();
        // Server expects the field name 'image'
        formData.append('image', imageFile);
        return apiClient.post('/profile/me/profile-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    uploadCV: (cvFile) => {
        const formData = new FormData();
        // Server expects the field name 'cv'
        formData.append('cv', cvFile);
        return apiClient.post('/profile/me/cv', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};

// Projects API
export const projectAPI = {
    getUserProjects: (userId) => apiClient.get(`/projects/user/${userId}`),
    getUserProjectsByUsername: (username) => apiClient.get(`/projects/username/${username}`),
    getCurrentUserProjects: () => apiClient.get('/projects/me'),
    getProject: (id) => apiClient.get(`/projects/${id}`),
    createProject: (projectData) => apiClient.post('/projects', projectData),
    // Server expects PATCH for updates
    updateProject: (id, projectData) => apiClient.patch(`/projects/${id}`, projectData),
    deleteProject: (id) => apiClient.delete(`/projects/${id}`),
    uploadProjectImage: (id, imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        return apiClient.post(`/projects/${id}/image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    reorderProjects: (projectOrders) => apiClient.post('/projects/reorder', { projectOrders })
};

// Admin API
export const adminAPI = {
    getAllUsers: (params) => apiClient.get('/admin/users', { params }),
    getUser: (id) => apiClient.get(`/admin/users/${id}`),
    createUser: (userData) => apiClient.post('/admin/users', userData),
    updateUser: (id, userData) => apiClient.patch(`/admin/users/${id}`, userData),
    deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
    getStats: () => apiClient.get('/admin/stats')
};

export default {
    auth: authAPI,
    profiles: profileAPI,
    projects: projectAPI,
    admin: adminAPI
};

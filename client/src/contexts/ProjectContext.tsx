import React, { createContext, useContext, useState, useEffect } from 'react';
import { projectAPI } from '../api/multiUserApi';
import { useAuth } from './AuthContext';

export interface ProjectData {
    id: string;
    userId: string;
    title: string;
    description: string;
    technologies: string[];
    image?: string;
    githubUrl?: string;
    liveUrl?: string;
    videoUrl?: string;
    order: number;
    isPublic: boolean;
    isImported: boolean;
    isVisibleInPortfolio: boolean;
    sourceType?: 'github' | 'custom';
    sourceId?: string;
    createdAt: string;
    updatedAt: string;
}

interface ProjectContextType {
    projects: ProjectData[];
    loading: boolean;
    error: string | null;
    getUserProjects: (usernameOrId?: string) => Promise<ProjectData[]>;
    getProject: (id: string) => Promise<ProjectData | null>;
    createProject: (projectData: Omit<ProjectData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<ProjectData>;
    updateProject: (id: string, projectData: Partial<ProjectData>) => Promise<ProjectData>;
    deleteProject: (id: string) => Promise<void>;
    uploadProjectImage: (id: string, file: File) => Promise<string>;
    reorderProjects: (projectOrders: { id: string, order: number }[]) => Promise<void>;
    clearProjectError: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load current user's projects when authenticated
    useEffect(() => {
        if (user) {
            getUserProjects();
        } else {
            setProjects([]);
        }
    }, [user]);

    // Helper to normalize server project to UI shape
    const normalizeProject = (raw: any): ProjectData => ({
        id: raw.id || raw._id,
        userId: raw.userId,
        title: raw.title || '',
        description: raw.description || '',
        technologies: Array.isArray(raw.technologies) ? raw.technologies : [],
        image: raw.imageUrl,
        githubUrl: raw.githubUrl,
        liveUrl: raw.projectUrl,
        videoUrl: undefined,
        order: typeof raw.order === 'number' ? raw.order : 0,
        isPublic: typeof raw.visible === 'boolean' ? raw.visible : (typeof raw.isVisibleInPortfolio === 'boolean' ? raw.isVisibleInPortfolio : true),
        isImported: typeof raw.isImported === 'boolean' ? raw.isImported : (raw.sourceType === 'github'),
        isVisibleInPortfolio: typeof raw.isVisibleInPortfolio === 'boolean' ? raw.isVisibleInPortfolio : true,
        sourceType: raw.sourceType,
        sourceId: raw.sourceId,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt
    });

    const getUserProjects = async (usernameOrId?: string) => {
        try {
            setLoading(true);
            setError(null);

            let response;
            if (usernameOrId) {
                // Check if the input is a username or user ID
                if (usernameOrId.match(/^[0-9a-fA-F]{24}$/)) {
                    response = await projectAPI.getUserProjects(usernameOrId);
                } else {
                    response = await projectAPI.getUserProjectsByUsername(usernameOrId);
                }
            } else {
                response = await projectAPI.getCurrentUserProjects();
            }

            const apiProjects = response?.data?.data?.projects || response?.data?.projects || response?.data || [];
            const normalized = (apiProjects as any[]).map(normalizeProject);
            // Sort projects by order
            const sortedProjects = normalized.sort((a, b) => a.order - b.order);
            setProjects(sortedProjects);
            return sortedProjects;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load projects');
            return [];
        } finally {
            setLoading(false);
        }
    };

    const getProject = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await projectAPI.getProject(id);
            const raw = response?.data?.data?.project || response?.data?.project || response?.data;
            return normalizeProject(raw);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load project');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const createProject = async (projectData: Omit<ProjectData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        try {
            setLoading(true);
            setError(null);
            // Map UI fields to server payload
            const payload: any = {
                title: projectData.title,
                description: projectData.description,
                technologies: projectData.technologies,
                githubUrl: projectData.githubUrl,
                projectUrl: projectData.liveUrl,
                visible: projectData.isPublic,
                order: projectData.order,
                isImported: projectData.isImported,
                isVisibleInPortfolio: projectData.isVisibleInPortfolio,
                sourceType: (projectData as any).sourceType,
                sourceId: (projectData as any).sourceId
            };
            const response = await projectAPI.createProject(payload);
            const raw = response?.data?.data?.project || response?.data?.project || response?.data;
            const normalized = normalizeProject(raw);
            setProjects(prev => [...prev, normalized].sort((a, b) => a.order - b.order));
            return normalized;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create project');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateProject = async (id: string, projectData: Partial<ProjectData>) => {
        try {
            setLoading(true);
            setError(null);
            // Map UI fields to server payload
            const payload: any = { ...projectData } as any;
            if (payload.isPublic !== undefined) {
                payload.visible = payload.isPublic;
                delete payload.isPublic;
            }
            if (payload.liveUrl !== undefined) {
                payload.projectUrl = payload.liveUrl;
                delete payload.liveUrl;
            }
            const response = await projectAPI.updateProject(id, payload);
            const raw = response?.data?.data?.project || response?.data?.project || response?.data;
            const normalized = normalizeProject(raw);
            setProjects(prev => prev.map(project => project.id === id ? normalized : project));
            return normalized;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update project');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteProject = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            await projectAPI.deleteProject(id);
            setProjects(prev => prev.filter(project => project.id !== id));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete project');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const uploadProjectImage = async (id: string, file: File) => {
        try {
            setLoading(true);
            setError(null);
            const response = await projectAPI.uploadProjectImage(id, file);
            const raw = response?.data?.data?.project || response?.data?.project || response?.data;
            const normalized = normalizeProject(raw);
            setProjects(prev => prev.map(p => p.id === id ? normalized : p));
            return normalized.image || '';
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload project image');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const reorderProjects = async (projectOrders: { id: string, order: number }[]) => {
        try {
            setLoading(true);
            setError(null);

            // Update locally first for optimistic UI update
            const updatedProjects = [...projects];
            projectOrders.forEach(({ id, order }) => {
                const projectIndex = updatedProjects.findIndex(project => project.id === id);
                if (projectIndex !== -1) {
                    updatedProjects[projectIndex] = { ...updatedProjects[projectIndex], order };
                }
            });

            // Sort the updated projects by order
            const sortedProjects = updatedProjects.sort((a, b) => a.order - b.order);
            setProjects(sortedProjects);

            // Send update to server
            await projectAPI.reorderProjects(projectOrders);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reorder projects');
            // If there's an error, refresh the projects from the server
            getUserProjects();
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const clearProjectError = () => setError(null);

    return (
        <ProjectContext.Provider
            value={{
                projects,
                loading,
                error,
                getUserProjects,
                getProject,
                createProject,
                updateProject,
                deleteProject,
                uploadProjectImage,
                reorderProjects,
                clearProjectError
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
};

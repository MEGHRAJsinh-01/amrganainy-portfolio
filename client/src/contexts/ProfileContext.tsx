import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { profileAPI } from '../api/multiUserApi';
import { useAuth } from './AuthContext';

import { IProfile } from '../types';

interface ProfileContextType {
    profile: IProfile | null;
    loading: boolean;
    error: string | null;
    getProfile: (username?: string) => Promise<IProfile | null>;
    getProfileByUsername: (username: string) => Promise<{ profile: IProfile, user: any } | null>;
    updateProfile: (profileData: Partial<IProfile>) => Promise<void>;
    uploadProfileImage: (file: File) => Promise<string>;
    uploadCV: (file: File) => Promise<string>;
    clearProfileError: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<IProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load current user's profile when authenticated
    useEffect(() => {
        if (user) {
            getProfile();
        } else {
            setProfile(null);
        }
    }, [user]);

    const getProfileByUsername = useCallback(async (username: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await profileAPI.getProfileByUsername(username);
            const profileData = response?.data?.data;
            if (profileData) {
                setProfile(profileData.profile);
            }
            return profileData;
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to load profile for ${username}`);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);


    const getProfile = useCallback(async (username?: string) => {
        try {
            setLoading(true);
            setError(null);

            let response;
            if (username) {
                response = await profileAPI.getProfileByUsername(username);
            } else if (user) {
                response = await profileAPI.getCurrentUserProfile();
            } else {
                throw new Error('No user or username provided');
            }

            // Server response shape: { status, data: { profile } }
            const apiUserRaw = response?.data?.data?.user || response?.data?.user;
            const apiProfileRaw = response?.data?.data?.profile || response?.data?.profile || response?.data;

            // Simple normalization - just ensure basic fields are present
            const normalizeProfile = (raw: any) => {
                if (!raw) return raw;

                return {
                    ...raw,
                    // Ensure id is available consistently
                    id: raw.id || raw._id || '',
                    userId: raw.userId || '',
                    name: raw.name || '',
                    title: raw.title || '',
                    location: raw.location || '',
                    contactEmail: raw.contactEmail || '',
                    skills: Array.isArray(raw.skills) ? raw.skills : [],
                    socialLinks: raw.socialLinks || {},
                    // Ensure both bio/about stay in sync for UI components
                    bio: raw.bio || raw.about || '',
                    about: raw.about || raw.bio || '',
                    languages: raw.languages || [],
                    theme: raw.theme || raw.settings?.theme,
                    isPublic: typeof raw.isPublic === 'boolean' ? raw.isPublic : true,
                    customDomain: raw.customDomain
                };
            };

            const apiProfile = (() => {
                const p = normalizeProfile(apiProfileRaw);
                // If profile lacks contactEmail or name, fallback to user summary
                if (apiUserRaw) {
                    p.contactEmail = p.contactEmail || apiUserRaw.email || '';
                    if (!p.name) p.name = apiUserRaw.username || p.name || '';
                }
                return p;
            })();

            setProfile(apiProfile);
            return apiProfile;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load profile');
            return null;
        } finally {
            setLoading(false);
        }
    }, [user]);

    const updateProfile = useCallback(async (profileData: Partial<IProfile>) => {
        try {
            setLoading(true);
            setError(null);
            const response = await profileAPI.updateProfile(profileData);
            const apiUserRaw = response?.data?.data?.user || response?.data?.user;
            const apiProfileRaw = response?.data?.data?.profile || response?.data?.profile || response?.data;

            // Simple normalization - just ensure basic fields are present
            const normalizeProfile = (raw: any) => {
                if (!raw) return raw;

                return {
                    ...raw,
                    // Ensure id is available consistently
                    id: raw.id || raw._id || '',
                    userId: raw.userId || '',
                    name: raw.name || '',
                    title: raw.title || '',
                    location: raw.location || '',
                    contactEmail: raw.contactEmail || '',
                    skills: Array.isArray(raw.skills) ? raw.skills : [],
                    socialLinks: raw.socialLinks || {},
                    // Ensure both bio/about stay in sync for UI components
                    bio: raw.bio || raw.about || '',
                    about: raw.about || raw.bio || '',
                    languages: raw.languages || [],
                    theme: raw.theme || raw.settings?.theme,
                    isPublic: typeof raw.isPublic === 'boolean' ? raw.isPublic : true,
                    customDomain: raw.customDomain
                };
            };

            const apiProfile = (() => {
                const p = normalizeProfile(apiProfileRaw);
                if (apiUserRaw) {
                    p.contactEmail = p.contactEmail || apiUserRaw.email || '';
                    if (!p.name) p.name = apiUserRaw.username || p.name || '';
                }
                return p;
            })();

            setProfile(apiProfile);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const uploadProfileImage = useCallback(async (file: File) => {
        try {
            setLoading(true);
            setError(null);
            const response = await profileAPI.uploadProfileImage(file);
            const imageUrl = response?.data?.data?.profileImageUrl || response?.data?.profileImageUrl;
            // Update the profile with the new image URL
            setProfile(prev => prev ? { ...prev, profileImage: imageUrl, profileImageUrl: imageUrl } : null);
            return imageUrl;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload profile image');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const uploadCV = useCallback(async (file: File) => {
        try {
            setLoading(true);
            setError(null);
            const response = await profileAPI.uploadCV(file);
            const cvUrl = response?.data?.data?.cvFileUrl || response?.data?.cvFileUrl;
            // Update the profile with the new CV URL
            setProfile(prev => prev ? { ...prev, cvFile: cvUrl, cvFileUrl: cvUrl } : null);
            return cvUrl;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload CV');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearProfileError = () => setError(null);

    return (
        <ProfileContext.Provider
            value={{
                profile,
                loading,
                error,
                getProfile,
                getProfileByUsername,
                updateProfile,
                uploadProfileImage,
                uploadCV,
                clearProfileError
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};

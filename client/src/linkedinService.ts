import { CLOUD_API_URL, LOCAL_API_URL } from './constants';

export const fetchLinkedInProfile = async (username: string) => {
    const isProd = import.meta.env.MODE === 'production';
    const apiBaseUrl = isProd ? CLOUD_API_URL : LOCAL_API_URL;
    const response = await fetch(`${apiBaseUrl}/linkedin/profile/${username}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch LinkedIn profile: ${response.status}`);
    }
    return await response.json();
};
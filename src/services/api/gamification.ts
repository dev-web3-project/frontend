import apiPublic from './api-public';

export const getGamificationProfile = async (username: string) => {
    const response = await apiPublic.get(`/user/gamification/${username}`);
    return response.data;
};

export const recordLoginStreak = async (username: string) => {
    const response = await apiPublic.post(`/user/gamification/${username}/login`);
    return response.data;
};

export const requestMentorship = async (data: { mentorUsername: string, menteeUsername: string, moduleId: number }) => {
    const response = await apiPublic.post(`/user/gamification/mentorship/request`, data);
    return response.data;
};

export const getMenteeRequests = async (username: string) => {
    const response = await apiPublic.get(`/user/gamification/mentorship/mentee/${username}`);
    return response.data;
};

export const getMentorRequests = async (username: string) => {
    const response = await apiPublic.get(`/user/gamification/mentorship/mentor/${username}`);
    return response.data;
};

export const updateMentorshipStatus = async (id: number, status: string) => {
    const response = await apiPublic.put(`/user/gamification/mentorship/${id}/status?status=${status}`);
    return response.data;
};

export const getLeaderboard = async () => {
    const response = await apiPublic.get(`/user/gamification/leaderboard`);
    return response.data;
};

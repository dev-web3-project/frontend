import { notifyError, notifySuccess } from "../../components/notify";
import api from "./api";

export const getAllAnnouncements = async () => {
  try {
    const response = await api.get("/announcement/all");
    return response.data;
  } catch (error: any) {
    notifyError(error);
  }
};

export const createAssignment = async (data: any) => {
  try {
    const response = await api.post("/announcement/assignment", data);
    notifySuccess("Announcement created successfully");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const createExam = async (data: any) => {
  try {
    const response = await api.post("/announcement/exam", data);
    notifySuccess("Announcement created successfully");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const createEvent = async (data: any) => {
  try {
    const response = await api.post("/announcement/event", data);
    notifySuccess("Announcement created successfully");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const createMaintenance = async (data: any) => {
  try {
    const response = await api.post("/announcement/maintenance", data);
    notifySuccess("Announcement created successfully");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const deleteAnnouncement = async (id: string) => {
  try {
    const response = await api.delete(`/announcement/${id}`);
    notifySuccess("Announcement deleted successfully");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

// ── Notifications ──────────────────────────────────────────

export const getUserNotifications = async (userId: string) => {
  try {
    const response = await api.get(`/announcement/notifications/user/${userId}`);
    return response.data;
  } catch (error: any) {
    notifyError(error.response?.data || error.message || "Erreur inconnue");
  }
};

export const getUnreadNotifications = async (userId: string) => {
  try {
    const response = await api.get(`/announcement/notifications/user/${userId}/unread`);
    return response.data;
  } catch (error: any) {
    notifyError(error.response?.data || error.message || "Erreur inconnue");
  }
};

export const sendNotification = async (data: {
  userId: string;
  titre: string;
  contenu: string;
  genre?: string;
}) => {
  try {
    const response = await api.post(`/announcement/notifications/send`, data);
    notifySuccess("Notification envoyée");
    return response.data;
  } catch (error: any) {
    notifyError(error.response?.data || error.message || "Erreur inconnue");
  }
};

export const markNotificationAsRead = async (id: number) => {
  try {
    await api.put(`/announcement/notifications/${id}/read`);
  } catch (error: any) {
    notifyError(error.response?.data || error.message || "Erreur inconnue");
  }
};

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    await api.put(`/announcement/notifications/user/${userId}/read-all`);
  } catch (error: any) {
    notifyError(error.response?.data || error.message || "Erreur inconnue");
  }
};

export const deleteNotification = async (id: number) => {
  try {
    await api.delete(`/announcement/notifications/${id}`);
  } catch (error: any) {
    notifyError(error.response?.data || error.message || "Erreur inconnue");
  }
};

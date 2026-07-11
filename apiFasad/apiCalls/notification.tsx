import { DELETE, GET, PUT } from "../httpMethod/method";
import { ENDPOINTS } from "../apiEndPoints/auth.endpoints";

// get all notifications
export const getAllUserNotifications = () =>
  GET<any[]>(ENDPOINTS.NOTIFICATION.allNotification);

// mark single notification read
export const markNotificationRead = (id: string) =>
  PUT(ENDPOINTS.NOTIFICATION.markOneRead, { id });

// mark all notifications read
export const markAllNotificationsRead = () =>
  PUT(ENDPOINTS.NOTIFICATION.markAllRead, {});

// clear all notifications
export const clearAllNotifications = () =>
  PUT(ENDPOINTS.NOTIFICATION.clearAll, {});

// delete one notification
export const deleteNotification = (id: string) =>
  DELETE(ENDPOINTS.NOTIFICATION.deleteOne, { id });
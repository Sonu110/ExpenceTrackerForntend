export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
  },
  USERS: {  
    userData: "/api/auth/user",
    userDetails: "/api/auth/userProfiles",
    userUpdate: "/api/auth/userUpdate",
    userTrackOrder: "/api/auth/ordersTrack",
    
  },
  ORDERS: {
    allFoxesOrder :"/api/auth/all/forex-orders"
  },
   BUYSELLCURRANCY: {  
    createOrder: "/api/auth/createOrder",
  },
  ADMIN:
  {
    allUserData: '/api/auth/admin/users',
    allUserOrderData: '/api/auth/admin/orders'  
  },

  NOTIFICATION: {
    allNotification: "/api/auth/notification",
    markOneRead: "/api/auth/notification/read-one",
    markAllRead: "/api/auth/notification/read-all",
    clearAll: "/api/auth/notification/clear-all",
    deleteOne: "/api/auth/notification",
  }
  
};

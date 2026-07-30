export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
  },
  USERS: {  
    userCategories: "/api/auth/categories",
    userTransaction: "/api/auth/transactions",
    userReceipt: "/api/auth/receipts",
    userUpdate: "/api/auth/update",
    getUserThisMonthData :"/api/auth/dashboard",
    Userforgotpassword :"/api/auth/forgot-password",
    getResetPassword :"/api/auth/reset-password",
    getVerifyOtp :"/api/auth/verify-otp"
    
    
  },
 
  
};

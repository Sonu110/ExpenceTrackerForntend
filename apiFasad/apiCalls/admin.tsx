import { DELETE, GET, POST, PUT } from "../httpMethod/method";
import { ENDPOINTS } from "../apiEndPoints/auth.endpoints";


export const getAllUsersData = (query = '') =>
  GET<any[]>(`${ENDPOINTS.ADMIN.allUserData}/?${query}`);

export const deleteUsersData = (query = '') =>
  DELETE<any[]>(`${ENDPOINTS.ADMIN.allUserData}/?${query}`);
export const updateUserData = (query = '' , paylod:any) =>
  PUT<any[]>(`${ENDPOINTS.ADMIN.allUserData}/?${query}` , paylod);

export const getAllUsersOrderData = (query = '') =>
  GET<any[]>(`${ENDPOINTS.ADMIN.allUserOrderData}/?${query}`);
export const updateStatusUsersOrderData = (paylod:any) =>
  PUT<any[]>(`${ENDPOINTS.ADMIN.allUserOrderData}`, paylod);





import { DELETE, GET, POST, PUT } from "../httpMethod/method";
import { ENDPOINTS } from "../apiEndPoints/auth.endpoints";


export const getUsers = () =>
  GET<any[]>(ENDPOINTS.AUTH.ME);


export const getUsersDetails = () =>
  GET<any[]>(ENDPOINTS.USERS.userDetails);


export const updateUserDetails = (payload:any) =>
  PUT(ENDPOINTS.USERS.userUpdate, payload);




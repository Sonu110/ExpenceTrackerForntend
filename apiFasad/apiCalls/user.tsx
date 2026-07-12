import { DELETE, GET, POST, PUT } from "../httpMethod/method";
import { ENDPOINTS } from "../apiEndPoints/auth.endpoints";


export const getUsers = () =>
  GET<any[]>(ENDPOINTS.AUTH.ME);


export const getUsersDetails = () =>
  GET<any[]>(ENDPOINTS.USERS.userDetails);


export const updateUserDetails = (payload:any) =>
  PUT(ENDPOINTS.USERS.userUpdate, payload);



export const addUserCategories = (payload:any) =>
  POST(ENDPOINTS.USERS.userCategories, payload);


export const getUserCategories = () =>
  GET(ENDPOINTS.USERS.userCategories);



export const deleteCategory = (id:string) =>
  DELETE(`${ENDPOINTS.USERS.userCategories}/${id}` );

export const updateCategory = (id:string,payload:any) =>
  PUT(`${ENDPOINTS.USERS.userCategories}/${id}` ,payload);


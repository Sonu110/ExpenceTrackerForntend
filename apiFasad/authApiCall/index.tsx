import { DELETE, GET, POST, PUT } from "../httpMethod/method";
import { ENDPOINTS } from "../apiEndPoints/auth.endpoints";


export const registerUser = (payload:any) =>
  POST(ENDPOINTS.AUTH.REGISTER ,payload);

export const loginUser = (payload:any) =>
  POST(ENDPOINTS.AUTH.LOGIN ,payload);


export const loginOutUser = () =>
  POST(ENDPOINTS.AUTH.LOGOUT);




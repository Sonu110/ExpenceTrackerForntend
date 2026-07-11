import { DELETE, GET, POST, PUT } from "../httpMethod/method";
import { ENDPOINTS } from "../apiEndPoints/auth.endpoints";


export const createOrder = (payload:any) =>
  POST(ENDPOINTS.BUYSELLCURRANCY.createOrder, payload);



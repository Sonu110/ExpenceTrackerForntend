import { DELETE, GET, POST, PUT } from "../httpMethod/method";
import { ENDPOINTS } from "../apiEndPoints/auth.endpoints";


export const createTransaction = (payload:any) =>
  POST<any[]>(`${ENDPOINTS.USERS.userTransaction}`,payload);

export const getTransaction = () =>
  GET<any[]>(`${ENDPOINTS.USERS.userTransaction}`);

export const deteleTransaction = (id:string) =>
  DELETE<any[]>(`${ENDPOINTS.USERS.userTransaction}/${id}`);








import { DELETE, GET, POST, PUT } from "../httpMethod/method";
import { ENDPOINTS } from "../apiEndPoints/auth.endpoints";


export const createTransaction = (payload:any) =>
  POST<any[]>(`${ENDPOINTS.USERS.userTransaction}`,payload);






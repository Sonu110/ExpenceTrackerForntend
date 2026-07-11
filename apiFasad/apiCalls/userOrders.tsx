import { DELETE, GET, POST, PUT } from "../httpMethod/method";
import { ENDPOINTS } from "../apiEndPoints/auth.endpoints";


export const getUsersOrder = (query = '') =>
  GET<any[]>(`${ENDPOINTS.ORDERS.allFoxesOrder}${query}`);

export const getUsersOrderTrack = (quary='') =>
  GET<any[]>(`${ENDPOINTS.USERS.userTrackOrder}?${quary}`);






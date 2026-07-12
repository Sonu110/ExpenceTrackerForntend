import { DELETE, GET, POST, PUT } from "../httpMethod/method";
import { ENDPOINTS } from "../apiEndPoints/auth.endpoints";


export const getUsersOrderTrack = (quary='') =>
  GET<any[]>(`${ENDPOINTS.USERS.userTrackOrder}?${quary}`);






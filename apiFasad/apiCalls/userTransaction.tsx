import { DELETE, GET, POST, PUT } from '../httpMethod/method';
import { ENDPOINTS } from '../apiEndPoints/auth.endpoints';

export const createTransaction = (payload: any) => POST<any[]>(`${ENDPOINTS.USERS.userTransaction}`, payload);

export const getTransaction = (
  params: {
    dateFilter?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    page?: number;
    limit?: number;
  } = {}
) => {
  const query: Record<string, string> = {};

  if (params.dateFilter) query.dateFilter = params.dateFilter;

  if (params.dateFilter === 'custom') {
    if (params.startDate) query.startDate = new Date(params.startDate).toISOString();
    if (params.endDate) query.endDate = new Date(params.endDate).toISOString();
  }

  query.page = String(params.page ?? 0);
  query.limit = String(params.limit ?? 10);

  return GET<any>(`${ENDPOINTS.USERS.userTransaction}`, query);
};

export const searchTransaction = (
  params: {
    search?: string;
    dateFilter?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    page?: number;
    limit?: number;
  } = {}
) => {
  const query: Record<string, string> = {};

  if (params.search) query.search = params.search;
  if (params.dateFilter) query.dateFilter = params.dateFilter;

  if (params.dateFilter === 'custom') {
    if (params.startDate) query.startDate = new Date(params.startDate).toISOString();
    if (params.endDate) query.endDate = new Date(params.endDate).toISOString();
  }

  query.page = String(params.page ?? 0);
  query.limit = String(params.limit ?? 10);

  return GET<any>(`${ENDPOINTS.USERS.userTransaction}/search`, query);
};

export const deteleTransaction = (id: string) => DELETE<any[]>(`${ENDPOINTS.USERS.userTransaction}/${id}`);

export const getReceipts = () => GET<any[]>(`${ENDPOINTS.USERS.userReceipt}`);

import { fetchClient } from "./client";

export const GET = <T>(url: string, params?: any) =>
  fetchClient<T>(url, {
    method: "GET",
    params,
  });

export const POST = <T>(url: string, data?: any) =>
  fetchClient<T>(url, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const PUT = <T>(url: string, data?: any) =>
  fetchClient<T>(url, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const DELETE = <T>(url: string) =>
  fetchClient<T>(url, {
    method: "DELETE",
  });

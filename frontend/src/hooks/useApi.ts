import { api } from "../lib/api";

export function useApi() {
  const get = async <T>(url: string, params?: Record<string, unknown>) => {
    const { data } = await api.get<T>(url, { params });
    return data;
  };

  const post = async <T>(url: string, body: unknown) => {
    const { data } = await api.post<T>(url, body);
    return data;
  };

  const patch = async <T>(url: string, body: unknown) => {
    const { data } = await api.patch<T>(url, body);
    return data;
  };

  const remove = async <T>(url: string) => {
    const { data } = await api.delete<T>(url);
    return data;
  };

  return { get, post, patch, remove };
}

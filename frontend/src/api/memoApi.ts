import client from "./client";

import type {
  getMemosParams,
  MemoItem,
  PaginatedMemosRes,
} from "../types/dashboard";

export const memoApi = {
  getMemos: async (params?: getMemosParams) => {
    const res = await client.get<{
      success: boolean;
      data: PaginatedMemosRes;
    }>("/memos", {
      params,
    });

    return res.data.data;
  },
  createMemo: (data: Partial<MemoItem>) =>
    client.post<{ success: boolean; data: MemoItem }>("/memos", data),
  updateMemo: (id: string, data: Partial<MemoItem>) =>
    client.put(`/memos/${id}`, data),
  deleteMemo: (id: string) => client.delete(`/memos/${id}`),
  getMemoById: async (id: string) => {
    const res = await client.get<{ success: boolean; data: MemoItem }>(
      `/memos/${id}`,
    );
    return res.data.data;
  },
};

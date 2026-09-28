import client from "./client";

import type { MemoItem } from "../types/dashboard";

export const memoApi = {
  getMemos: () => client.get<MemoItem[]>("/memos"),
  createMemo: (data: Partial<MemoItem>) =>
    client.post<MemoItem>("/memos", data),
  updateMemo: (id: string, data: Partial<MemoItem>) =>
    client.put(`/memos/${id}`, data),
  deleteMemo: (id: string) => client.delete(`/memos/${id}`),
};

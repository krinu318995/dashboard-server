import client from "./client";
import type { CreateTaskDTO, TaskItem } from "../types/dashboard";

export const taskApi = {
  getTasks: async (params?: { start?: string; end?: string }) => {
    const res = await client.get<{
      success: boolean;
      data: { items: TaskItem[] };
    }>("/tasks", {
      params,
    });
    return res.data.data.items;
  },
  createTask: async (data: CreateTaskDTO) => {
    const res = client.post<{ success: boolean; data: TaskItem }>(
      "/tasks",
      data,
    );
    return res;
  },
  updateTask: async (id: string, data: Partial<TaskItem>) => {
    const res = client.put<{ success: boolean; data: TaskItem }>(
      `/tasks/${id}`,
      data,
    );
    return res;
  },
  deleteTask: async (id: string) => {
    const res = client.delete<{
      success: boolean;
      message: string;
      data?: { id: string };
    }>(`/tasks/${id}`);
    return res;
  },
  getTaskById: async (id: string) => {
    const res = client.get<{ success: boolean; data: TaskItem }>(
      `/tasks/${id}`,
    );
    return res;
  },
  toggleTaskCompletion: async (id: string, date: string) => {
    const res = client.post<{ success: boolean; data: string[] }>(
      `/tasks/${id}/completions`,
      { date },
    );
    return res;
  },
};

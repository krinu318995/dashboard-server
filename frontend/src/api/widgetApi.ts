import client from "./client";
import type { Widget, WidgetData, WidgetMode } from "../types/dashboard";

export const widgetApi = {
  getWidgets: async (): Promise<Widget[]> => {
    const res = await client.get<{
      success: boolean;
      message: string;
      data: Widget[];
    }>("/widgets");
    return res.data.data;
  },
  createWidget: async (widget: Partial<Widget>): Promise<Widget> => {
    const res = await client.post<{
      success: boolean;
      message: string;
      data: Widget;
    }>("/widgets", widget);
    return res.data.data;
  },
  deleteWidget: async (id: string): Promise<{ id: string }> => {
    const res = await client.delete<{
      success: boolean;
      message: string;
      data: { id: string };
    }>(`/widgets/${id}`);
    return res.data.data;
  },
};

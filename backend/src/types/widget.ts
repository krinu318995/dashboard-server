import { RowDataPacket } from "mysql2";

export interface WidgetRow extends RowDataPacket {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  viewMode: string;
  data: string | null;
  update_at: string;
}

export interface WidgetPayload {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  viewMode?: string;
  data?: any;
  mode?: string;
}

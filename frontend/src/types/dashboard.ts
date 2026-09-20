// src/types/dashboard.ts
import type { Dispatch, SetStateAction } from "react";
export type WidgetMode = "todos" | "dday" | "mini-calendar";
export type taskStatus = "todo" | "in-progress" | "done";
export type MemoViewMode = "normal" | "minimal-frame";

export const DEFAULT_SIZES: Record<WidgetType, { w: number; h: number }> = {
  todo: { w: 3, h: 2 },
  weather: { w: 2, h: 2 },
  clock: { w: 2, h: 2 },
  "weather-clock": { w: 4, h: 2 },
  memo: { w: 4, h: 3 },
};
export const DEFAULT_POSITION = { x: 0, y: 0 };
export type WidgetType =
  | "todo"
  | "clock"
  | "memo"
  | "weather"
  | "weather-clock";

// export interface Widget {
//   id: string;
//   type: WidgetType;
//   x: number;
//   y: number;
//   w: number;
//   h: number;
//   mode?: WidgetMode;
//   viewMode?: MemoViewMode;

//   data?: {
//     tasks?: Array<{
//       id: string;
//       content: string;
//       dueDate: string;
//       status: taskStatus;
//     }>;

//     memo?: MemoItem;
//   };
// }

export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  city: string;
  humidity: string;
}
export interface SidebarWidgetItem {
  type: string;
  label: string;
  link?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  content: string;
  // imageUrl?: string;
  startDate?: string;
  dueDate: string; // 예: "2026-08-04"
  isDday: boolean;
  status: taskStatus;
  completedDates?: string[]; //반복 일정
}

export interface MemoItem {
  id: string; // 고유 메모 ID (위젯 생성 시 매핑)
  title?: string; // 메모 제목
  memoText: string; // 메모 본문 내용
  imageUrl?: string; // 첨부 이미지 base64 (선택적)
  createdAt: number; // 생성 일시 (타임스탬프)
  updatedAt?: number; // 수정 일시 (타임스탬프)
  isArchived?: boolean; // 보관/숨김 여부 (메모 관리 페이지 활용)
}

export interface WidgetData {
  tasks?: TaskItem[];
  memo?: MemoItem;
}

export interface Widget {
  id: string;
  type: WidgetType;
  x: number; // Grid 위치
  y: number;
  w: number; // Grid 크기
  h: number;
  // title: string; // 위젯 상단 타이틀
  mode?: WidgetMode;
  viewMode?: MemoViewMode;

  // 위젯 내부에 들어갈 데이터 (일정, 메모 내용 등)
  data?: WidgetData;
}

export type setWidgetsType = Dispatch<SetStateAction<Widget[]>>;

export interface MemoStateProps {
  memos?: MemoItem[];
  setMemos?: React.Dispatch<React.SetStateAction<MemoItem[]>>;
}

export interface TaskStateProps {
  tasks: TaskItem[];
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
}

export interface BaseWidgetProps {
  widget: Widget;
  setWidgets: React.Dispatch<React.SetStateAction<Widget[]>>;
}
export interface MemoWidgetProps extends BaseWidgetProps, MemoStateProps {}

export interface TodoWidgetProps extends BaseWidgetProps, TaskStateProps {
  mode: WidgetMode;
}

export interface DashboardSharedProps extends MemoStateProps, TaskStateProps {
  widgets: Widget[];
  setWidgets: React.Dispatch<React.SetStateAction<Widget[]>>;
}

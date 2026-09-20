import { memo, type DragEvent } from "react";
import { useState, useEffect } from "react";
import {
  DEFAULT_SIZES,
  type Widget,
  type setWidgetsType,
  type SidebarWidgetItem,
  type MemoStateProps,
  type MemoItem,
  DEFAULT_POSITION,
} from "../types/dashboard.ts";
import { useNavigate } from "react-router-dom";
interface SidebarProps extends MemoStateProps {
  isOpen: boolean;
  setWidgets: setWidgetsType;
  link?: string; //라우팅 경로,
  widgets: Widget[];
  memos: MemoItem[];
}

const WIDGET_LIBRARY_ITEMS: SidebarWidgetItem[] = [
  { type: "todo", label: "플래너", link: "/calendar" },
  { type: "weather", label: "날씨" },
  { type: "clock", label: "시계" },
  { type: "weather-clock", label: "날씨 / 시계" },
  { type: "memo-manager", label: "메모 리스트", link: "/memos" },
];

export const Sidebar = ({
  isOpen,
  setWidgets,
  widgets,
  memos,
}: SidebarProps) => {
  // const [memoList, setMemoList] = useState<Widget[]>([]);
  const [selectedMemoId, setSelectedMemoId] = useState<string>("");
  const [selectedMemo, setSelectedMemo] = useState<string>("");
  // const activeMemoWidgets = (widgets ?? []).filter((w) => w.type === "memo");

  const memoList = (memos ?? [])
    .map((m) => {
      // const memoId = m.data?.memo?.id;
      // const matchedMemo = (memos ?? []).find((memo) => memo.id === memoId);
      // const memoData = matchedMemo || m.data?.memo;

      const memoId = m.id;
      const matchedMemo = (memos ?? []).find((memo) => memo.id === memoId);
      // const memoData = matchedMemo || m.data?.memo;
      console.log("확인", matchedMemo);
      // console.log("memoId: ", memoId);
      // console.log("m.id:", m.id);
      // console.log("m.matchedMemo:", matchedMemo);
      // console.log("memoData:", memoData);
      // if (!memoData) {
      //   return; // 메모 데이터가 없는 경우 null 반환
      // }

      return {
        widgetId: m.id,
        // type: m.type,
        // ...memoData,
        ...m,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
  console.log("memoList: ", memoList);
  console.log("selectedMemoId: ", selectedMemoId);
  const navigate = useNavigate();
  if (!isOpen) {
    return null; //사이드바가 닫혀있으면 아무것도 렌더링하지 않음
  }
  /**일반 위젯 */
  const handleDragStart = (e: DragEvent, widgetType: string) => {
    e.dataTransfer.setData("text/widget-type", widgetType); //그리드보드에서
  };

  /** todo */
  const handleLinkClick = (link?: string) => {
    if (link) {
      navigate(link);
    }
  };
  /**메모 위젯 */
  const handleMemoDragStart = (e: DragEvent, memo: MemoItem) => {
    // e.dataTransfer.setData("text/widget-type", "memo");
    const targetMemo = memoList.find((m) => m.id === memo.id);
    console.log("targetMemo: ", targetMemo);
    console.log("targetMemo.id: ", targetMemo?.id);
    if (targetMemo) {
      e.dataTransfer.setData("text/widget-type", "memo");

      const memoPayload = {
        id: memo.id,
        title: memo.title ?? "",
        memoText: memo.memoText ?? Date.now(),
        imageUrl: memo.imageUrl ?? Date.now(),
      };
      e.dataTransfer.setData(
        "text/widget-memo-data",
        JSON.stringify(memoPayload),
      );
    }
  };

  const handleCreateNewMemo = () => {
    const now = Date.now();
    const newMemoId = `memo_${crypto.randomUUID()}`;
    const { w, h } = DEFAULT_SIZES.memo;
    const newEmptyMemo = {
      id: `Widget_${now}`,
      type: "memo" as const,
      x: DEFAULT_POSITION.x,
      y: DEFAULT_POSITION.y,
      w,
      h,
      title: "",
      data: {
        memo: {
          id: newMemoId,
          title: "",
          memoText: "",
          createdAt: now,
          updatedAt: now,
        },
      },
    };

    setWidgets((prevWidgets: Widget[]) => [...prevWidgets, newEmptyMemo]);
  };

  return (
    <aside className={`dashboard-sidebar ${isOpen ? "" : "closed"}`}>
      <div className="sidebar-content">
        <h3>위젯 라이브러리</h3>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {WIDGET_LIBRARY_ITEMS.map((item) => (
            <li
              key={item.type}
              draggable
              onClick={() => handleLinkClick(item.link)}
              onDragStart={(e) => handleDragStart(e, item.type)}
            >
              {item.label}
            </li>
          ))}
        </ul>
        <h4>메모</h4>
        <div className="sidebar-content-select-container">
          <select
            name="selectMemo"
            id=""
            value={selectedMemoId}
            onChange={(e) => setSelectedMemoId(e.target.value)}
            style={{ padding: "6px", borderRadius: "4px" }}
          >
            <option value="">새 메모 작성</option>
            {memoList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
          {selectedMemoId === "" && (
            <button onClick={handleCreateNewMemo}>새 메모 작성</button>
          )}
          {selectedMemoId !== "" && (
            <div
              draggable
              onDragStart={(e) => {
                const targetMemo = (memos ?? []).find(
                  (m) => m.id === selectedMemoId,
                );
                if (targetMemo) {
                  handleMemoDragStart(e, targetMemo);
                }
              }}
              className="sidebar-content-select-container-memo-drag"
            >
              선택한 메모를 대시보드로 드래그
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

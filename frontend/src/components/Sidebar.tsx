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
import { memoApi } from "../api/memoApi.ts";
import { CustomSelect } from "./CustomSelect.tsx";
import { widgetApi } from "../api/widgetApi.ts";
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
  memos, //드롭다운에서 선택한 메모를 대시보드로 드롭할 때 사용
  setMemos,
}: SidebarProps) => {
  // const [memoList, setMemoList] = useState<Widget[]>([]);
  const [selectedMemoId, setSelectedMemoId] = useState<string>("");
  //사이드바에서 사용할 메모 데이터 상태
  const [sidebarMemos, setSidebarMemos] = useState<MemoItem[]>([]);
  const [memoVersion, setMemoVersion] = useState<number>(0); //메모 데이터 변경 감지용 상태
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const memoRefresh = () => {
    setMemoVersion((v) => v + 1);
  };

  const fetchMemos = async (currentPage: number) => {
    try {
      const res = await memoApi.getMemos({
        page: currentPage,
        limit: 5,
        search: "",
      });
      console.log(res.items, " Fetched Memos in Sidebar");
      const items = res.items ?? (res as any).data.items;
      console.log(items, "Fetched Memos items in Sidebar");
      console.log(res, "Fetched res items in Sidebar");
      setTotalPages(res.pagination.totalPage || 1);

      setSidebarMemos(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("사이드바 메모 조회 실패:", err);
    }
  };
  useEffect(() => {
    if (isOpen) {
      fetchMemos(currentPage);
    }
  }, [isOpen, memoVersion, currentPage]);

  const memoSelectOptions = sidebarMemos.map((m) => {
    const activeWidget = widgets.find(
      (w) => w.type === "memo" && w.data?.memo?.id === m.id,
    );

    const liveTitle = activeWidget?.data?.memo?.title ?? m.title;

    return {
      value: m.id,
      label: liveTitle?.trim() ? liveTitle : "제목 없는 메모",
    };
  });

  const navigate = useNavigate();
  if (!isOpen) {
    return null; //사이드바가 닫혀있으면 아무것도 렌c링하지 않음
  }
  /**일반 위젯 */
  const handleDragStart = async (e: DragEvent, widgetType: string) => {
    e.dataTransfer.setData("text/widget-type", widgetType); //그리드보드에서
  };

  /** todo */
  const handleLinkClick = (link?: string) => {
    // alert(link);
    if (link) {
      navigate(link);
    }
  };
  /**메모 위젯 */
  const handleMemoDragStart = (e: DragEvent, memo: MemoItem) => {
    e.dataTransfer.setData("text/widget-type", "memo");

    const memoPayload = {
      id: memo.id,
      title: memo.title ?? "",
      memoText: memo.memoText ?? "",
      imageUrl: memo.imageUrl ?? undefined,
    };
    e.dataTransfer.setData(
      "text/widget-memo-data",
      JSON.stringify(memoPayload),
    );
  };

  const handleCreateNewMemo = async () => {
    const { w, h } = DEFAULT_SIZES.memo;

    try {
      const memoData = await memoApi.createMemo({
        title: "",
        memoText: "",
      });

      const newWidgetId = crypto.randomUUID();

      const newMemo = memoData.data.data as MemoItem;
      const newEmptyMemo = {
        id: newWidgetId,
        type: "memo" as const,
        x: DEFAULT_POSITION.x,
        y: DEFAULT_POSITION.y,
        w,
        h,
        title: "",
        data: {
          memo: {
            id: newMemo.id,
            title: newMemo.title,
            memoText: newMemo.memoText,
            createdAt: newMemo.createdAt,
            updatedAt: newMemo.updatedAt,
          },
        },
      };

      await widgetApi.createWidget(newEmptyMemo);
      setWidgets((prevWidgets: Widget[]) => [...prevWidgets, newEmptyMemo]);
      setCurrentPage(1);
      if (setMemos) {
        setMemos((prev) => [newMemo, ...prev]);
      }

      alert("생성완료");
    } catch (err) {
      console.error(err);
      alert("메모 생성 중 오류가 발생하였습니다.");
    }
  };

  return (
    <aside className={`dashboard-sidebar ${isOpen ? "" : "closed"}`}>
      <div className="sidebar-content">
        <h3>위젯 라이브러리</h3>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {WIDGET_LIBRARY_ITEMS.map((item) => (
            <li
              key={item.type}
              draggable={item.type !== "memo-manager"}
              onClick={(e) => {
                e.stopPropagation();
                handleLinkClick(item.link);
              }}
              onDragStart={(e) => {
                if (item.type !== "memo-manager") {
                  handleDragStart(e, item.type);
                }
              }}
            >
              {item.label}
            </li>
          ))}
        </ul>
        <h4>메모</h4>
        <div className="sidebar-content-select-container">
          {/** 페이지네이션 넣을 select */}
          <CustomSelect
            name="selectMemo"
            value={selectedMemoId}
            onChange={(e) => setSelectedMemoId(e)}
            placeholderOption="새 메모 작성"
            // options={sidebarMemos.map((m) => ({
            //   value: m.id,
            //   label: m.title?.trim() ? m.title : "제목 없는 메모",
            // }))}
            options={memoSelectOptions}
            currentPage={currentPage ?? 1}
            totalPages={totalPages ?? 1}
            onPageChange={(page) => setCurrentPage(page)}
          />
          {selectedMemoId === "" && (
            <button
              className="sidebar-memo-btn-create"
              onClick={handleCreateNewMemo}
            >
              새 메모 작성
            </button>
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

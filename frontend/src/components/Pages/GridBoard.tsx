// src/components/GridBoard.tsx
import { memo, useRef, useState } from "react";
import type {
  DragEvent,
  MouseEvent as ReactMouseEvent,
  ChangeEvent,
} from "react";
import "../../assets/styles/gridboard.css";
import type {
  Widget,
  WidgetType,
  DashboardSharedProps,
  MemoItem,
  WidgetData,
} from "../../types/dashboard.ts";
import { DEFAULT_SIZES } from "../../types/dashboard.ts";
/**컴포넌트 */
import { ClockWidgets } from "../widgets/ClockWidget.tsx";
import { WeatherWidget } from "../widgets/WeatherWidget.tsx";
import { WeatherClockWidget } from "../widgets/WeatherClockWidget.tsx";
import { MemoWidget } from "../widgets/MemoWidget.tsx";
import { TodosWidget } from "../widgets/Todos.tsx";

const createInitialData = (
  type: WidgetType,
  memoDataString: string | null,
  savedMemos: MemoItem[] = [],
): WidgetData | undefined => {
  if (type !== "memo") return undefined;
  const now = Date.now();
  if (memoDataString) {
    try {
      const memoObj = JSON.parse(memoDataString);
      const saved = savedMemos.find((m) => m.id === memoObj.id);

      return {
        memo: {
          id: memoObj.id || `memo_${crypto.randomUUID()}`,
          title: saved?.title ?? memoObj.title ?? "",
          memoText: saved?.memoText ?? memoObj.memoText ?? "",
          imageUrl: saved?.imageUrl ?? memoObj.imageUrl ?? "",
          createdAt: saved?.createdAt ?? memoObj.createdAt ?? "",
          updatedAt: saved?.updatedAt ?? memoObj.updatedAt ?? "",
        },
      };
    } catch (err) {
      console.error(err, " 메모 초기 데이터 오류");
    }
  }

  return {
    memo: {
      id: `memo_${crypto.randomUUID()}`,
      title: "",
      memoText: "",
      createdAt: now,
      updatedAt: now,
    },
  };
};

export const GridBoard = ({
  widgets,
  setWidgets,
  tasks,
  setTasks,
  memos,
  setMemos,
}: DashboardSharedProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  // "gridRef는 <div> 전용 참조 객체"라고 미리 지정해둠

  const GRID_COLUMNS = 12;
  const ROW_HEIGHT = 100; // 각 행의 높이 (px)

  type WidgetMode = "todos" | "dday" | "mini-calendar";
  const modes: WidgetMode[] = ["todos", "dday", "mini-calendar"];

  const handlePrev = (widgetId: string) => {
    setWidgets((prev) =>
      prev.map((w) => {
        if (w.id !== widgetId) {
          return w;
        }
        const currentMode = w.mode || "todos";
        const prevIdx =
          (modes.indexOf(currentMode) - 1 + modes.length) % modes.length;

        return {
          ...w,
          mode: modes[prevIdx],
        };
      }),
    );
  };

  const handleNext = (widgetId: string) => {
    setWidgets((prev) =>
      prev.map((w) => {
        if (String(w.id) !== widgetId) {
          return w;
        }
        const currentMode = w.mode || "todos";
        const nextIdx =
          (modes.indexOf(currentMode) + 1 + modes.length) % modes.length;
        return {
          ...w,
          mode: modes[nextIdx],
        };
      }),
    );
  };

  const bringToFront = (widgetId: string) => {
    setWidgets((prev) => {
      const targetWidget = prev.find((w) => String(w.id) === String(widgetId));
      if (!targetWidget) {
        return prev;
      }
      return [
        ...prev.filter((w) => String(w.id) !== String(widgetId)),
        targetWidget,
      ];
    });
  };

  const handleDragStart = (e: DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    bringToFront(id);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();

    if (!gridRef.current) return;

    const existingWidgetId = e.dataTransfer.getData("text/plain");
    const newWidgetType = e.dataTransfer.getData(
      "text/widget-type",
    ) as WidgetType; // 위젯 타입 정보 가져오기
    // if(!gridRef.current || !widgetId ) return;

    /**getBoundingClientRect: element의 크기, 위치 정보를 담은 DOMRect 객체를 반환한다. */
    const rect = gridRef.current.getBoundingClientRect();

    const mouseX = e.clientX - rect.left; // 마우스 X 좌표 (그리드 기준)
    const mouseY = e.clientY - rect.top; // 마우스 Y 좌표 (그리드 기준)

    const columnWidth = rect.width / GRID_COLUMNS; // 각 열의 너비

    const newX = Math.floor(mouseX / columnWidth); // 새로운 X 좌표
    const newY = Math.floor(mouseY / ROW_HEIGHT); // 새로운 Y 좌표

    const clampledX = Math.max(0, Math.min(newX, GRID_COLUMNS - 1)); // 0~11 사이로 제한
    const clampledY = Math.max(0, newY); // 0 이상으로 제한

    const memoDataString = e.dataTransfer.getData("text/widget-memo-data");

    const now = Date.now();

    if (newWidgetType) {
      const { w: defaultW, h: defaultH } = DEFAULT_SIZES[newWidgetType] || {
        w: 2,
        h: 2,
      };

      const newWidget: Widget = {
        id: `Widget_${now}`,
        type: newWidgetType,
        x: clampledX,
        y: clampledY,
        w: defaultW,
        h: defaultH,
        mode: newWidgetType === "todo" ? "todos" : undefined,
        viewMode: newWidgetType === "memo" ? "minimal-frame" : undefined,
        data: createInitialData(newWidgetType, memoDataString, memos),
      };

      setWidgets((prevWidgets: Widget[]) => [...prevWidgets, newWidget]);
      return;
    }

    if (existingWidgetId) {
      setWidgets(
        (prevWidgets: Widget[]) => {
          const targetWidget = prevWidgets.find(
            (w) => String(w.id) === existingWidgetId,
          );
          if (!targetWidget) {
            return prevWidgets;
          }
          const safeX = Math.min(
            clampledX,
            GRID_COLUMNS - (targetWidget.w || 1),
          );

          const updatedTargetWidget = {
            ...targetWidget, //기존 위젯 크기 값 그대로 복사
            x: Math.max(0, safeX), //위젯 이동시 좌표만 새 값으로
            y: clampledY,
          };

          return [
            ...prevWidgets.filter((w) => String(w.id) !== existingWidgetId),
            updatedTargetWidget,
          ];
        },
        // prevWidgets.map(
        //   (w) =>
        //     String(w.id) === existingWidgetId
        //       ? {
        //           ...w,
        //           x: clampledX,
        //           y: clampledY,
        //         }
        //       : w, //
        // ),
      );
      return; //defaultW, defaultH 방지
    }
  }; //end handleDrop

  const handleTitleChange = (
    e: ChangeEvent<HTMLInputElement>,
    targetWidgetId: string,
  ) => {
    const newTitle = e.target.value;
    const now = Date.now();
    const targetWidget = widgets.find(
      (w) => String(w.id) === String(targetWidgetId),
    );
    const memoId = targetWidget?.data?.memo?.id;
    // const createdAt = targetWidget?.data?.memo?.createdAt || now;
    console.log(newTitle, "확인");
    if (!memoId) {
      return;
    }
    console.log(memoId, "확인 memoId");

    setWidgets((prev) =>
      prev.map((w) => {
        if (w.type === "memo" && w.data?.memo?.id === memoId) {
          return {
            ...w,
            data: {
              ...w.data,
              memo: {
                ...w.data?.memo,
                title: newTitle,
                updatedAt: now,
              },
            },
          };
        }
        return w;
      }),
    ); //end setWidgets
    console.log(targetWidget, "확인 targetWidget");

    if (setMemos) {
      setMemos((prev) =>
        //   {
        //   const targetWidget = widgets.find(
        //     (w) => String(w.id) === String(targetWidgetId),
        //   );

        //   const exists = prev.some((m) => m.id === memoId);
        //   if (exists) {
        //     return prev.map((m) =>
        //       m.id === memoId
        //         ? {
        //             ...m,
        //             title: newTitle,
        //             updatedAt: Date.now(),
        //           }
        //         : m,
        //     );
        //   }
        //   return [
        //     ...prev,
        //     {
        //       id: memoId,
        //       title: newTitle,
        //       memoText: targetWidget?.data?.memo?.memoText || "",
        //       createdAt: createdAt,
        //       updatedAt: now,
        //     },
        //   ];
        // }
        prev.map((m) =>
          m.id === memoId
            ? {
                ...m,
                title: newTitle,
                updatedAt: now,
              }
            : m,
        ),
      ); //end setMemos.

      console.log();
    }
  };

  const handleResizeStart = (
    e: ReactMouseEvent,
    widgetId: string,
    initialW: number,
    initialH: number,
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;

    if (!gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const columnWidth = rect.width / GRID_COLUMNS;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const newW = Math.max(1, initialW + Math.round(deltaX / columnWidth));
      const newH = Math.max(1, initialH + Math.round(deltaY / ROW_HEIGHT));

      setWidgets((prev) =>
        prev.map((w) => (w.id === widgetId ? { ...w, w: newW, h: newH } : w)),
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };
  return (
    <div
      ref={gridRef}
      className="grid-board-container"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {widgets.map((widget) => {
        const isMemoFramed =
          widget.type === "memo" && widget.viewMode === "minimal-frame";
        return (
          <div
            key={widget.id}
            className={`grid-widget-item ${isMemoFramed ? "memo-framed-item" : ""}`}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, widget.id.toString())}
            onMouseDown={() => bringToFront(widget.id.toString())}
            style={{
              // 동적 좌표값만 style로 제어
              gridColumnStart: widget.x + 1,
              gridColumnEnd: `span ${widget.w}`,
              gridRowStart: widget.y + 1,
              gridRowEnd: `span ${widget.h}`,
            }}
          >
            {/**HEADER */}
            {(widget.type === "memo" || widget.type === "todo") && (
              <div
                // className="widget-header"
                className={`widget-header ${isMemoFramed ? "memo-framed-header" : ""}`}
              >
                {widget.type === "memo" ? (
                  <input
                    type="text"
                    value={widget.data?.memo?.title ?? ""}
                    onChange={(e) => handleTitleChange(e, widget.id)}
                    placeholder="제목을 입력하세요..."
                    // 입력 중 드래그 및 마우스 이벤트 충돌 방지
                    onMouseDown={(e) => e.stopPropagation()}
                    className="widget-title widget-title-memo"
                  />
                ) : (
                  <div
                    className="widget-todo-header-left"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handlePrev(widget.id.toString())}
                      className="widget-nav-btn"
                    >
                      &lt;
                    </button>
                    <span
                      className="widget-title"
                      style={{ fontWeight: "bold" }}
                    >
                      {widget.mode === "todos"
                        ? "할 일"
                        : widget.mode === "dday"
                          ? "D-Day"
                          : "캘린더"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleNext(widget.id.toString())}
                      className="widget-nav-btn"
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </div>
            )}
            {/*삭제 버튼 추가 */}
            <button
              className="widget-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                setWidgets((prevWidgets: Widget[]) =>
                  prevWidgets.filter((w) => w.id !== widget.id),
                );
              }}
            >
              ×
            </button>
            {widget.type === "weather" && <WeatherWidget />}
            {widget.type === "clock" && <ClockWidgets />}
            {widget.type === "weather-clock" && <WeatherClockWidget />}
            {/* {widget.type==='memo' && widget.data?.memoText && (
            <div className='widget-memo-content' style={{marginTop:'auto'}}>
            {widget.data.memoText}
          </div>
          )} */}
            {widget.type === "todo" && (
              <TodosWidget
                widgets={widgets}
                setWidgets={setWidgets}
                tasks={tasks}
                setTasks={setTasks}
                mode={widget.mode || "todos"}
              ></TodosWidget>
            )}
            {widget.type === "memo" && (
              <MemoWidget
                widget={widget}
                setWidgets={setWidgets}
                memos={memos}
                setMemos={setMemos}
              />
            )}
            {/* <div className="widget-info">
            위치: ({widget.x}, {widget.y}) | 크기: {widget.w}x{widget.h}
          </div> */}
            <div
              className="widget-resize-handle"
              draggable={false}
              onMouseDown={(e) =>
                handleResizeStart(e, widget.id.toString(), widget.w, widget.h)
              }
            ></div>
          </div>
        );
      })}
    </div>
  );
};

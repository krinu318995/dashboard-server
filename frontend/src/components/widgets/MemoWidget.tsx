import react, { useState } from "react";
import "../../assets/styles/Memo.css";

import type { MemoViewMode, MemoWidgetProps } from "../../types/dashboard.ts";
import type { ChangeEvent, ClipboardEvent } from "react";
export const MemoWidget = ({
  widget,
  setWidgets,
  memos,
  setMemos,
}: MemoWidgetProps) => {
  const [isFooterOpen, setIsFooterOpen] = useState<boolean>(false);
  const currentMode: MemoViewMode = widget.viewMode || "normal";
  // const titleInputRef = useRef<HTMLInputElement | null>(null);
  // const [isEditing, setIsEditing] = useState(false);

  const handleModeChange = (mode: MemoViewMode) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === widget.id ? { ...w, viewMode: mode } : w)),
    );
  };

  const handleTextChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    // field: "title" | "memoText",
  ) => {
    const newText = e.target.value;
    const memoId = widget.data?.memo?.id || `memo_${crypto.randomUUID()}`;
    const now = widget.data?.memo?.createdAt || Date.now();
    setWidgets((prevWidgets) =>
      prevWidgets.map((w) => {
        if (w.type === "memo" && w.data?.memo?.id === memoId) {
          return {
            ...w,
            data: {
              ...w.data,
              memo: {
                ...w.data.memo,
                memoText: newText,
                updatedAt: now,
              },
            },
          };
        }
        return w;
      }),
    ); //setWidgets

    if (setMemos) {
      setMemos(
        (prevMemos) => {
          const exist = prevMemos.some((m) => String(m.id) === String(memoId));

          if (exist) {
            return prevMemos.map((memo) =>
              String(memo.id === String(memoId))
                ? {
                    ...memo,
                    memoText: newText,
                    updatedAt: now,
                  }
                : memo,
            );
          }
          return [
            ...prevMemos,
            {
              id: memoId,
              title: widget.data?.memo?.title || "",
              memoText: newText,
              imageUrl: widget.data?.memo?.imageUrl || "",
              createdAt: now,
              updatedAt: now,
            },
          ];
        },
        //   {
        //   const exists = prevMemos.some((m) => m.id === memoId);

        //   if (exists) {
        //     return prevMemos.map((m) =>
        //       m.id === memoId
        //         ? { ...m, memoText: newText, updatedAt: Date.now() }
        //         : m,
        //     );
        //   }
        //   return [
        //     ...prevMemos,
        //     {
        //       id: memoId,
        //       title: widget.data?.memo?.title,
        //       memoText: newText,
        //       imageUrl: widget.data?.memo?.imageUrl,
        //       createdAt: now,
        //     },
        //   ];
        // }
      );
    }
  }; //handleTextChange

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64Str = reader.result as string;
      const memoId = widget.data?.memo?.id || `memo_${crypto.randomUUID()}`;
      setWidgets((prev) =>
        prev.map((w) =>
          String(w.id) === String(widget.id)
            ? {
                ...w,
                data: {
                  ...w.data,
                  memo: {
                    ...(w.data?.memo || {
                      id: memoId,
                      createdAt: Date.now(),
                      memoText: "",
                    }),
                    imageUrl: base64Str,
                    updatedAt: Date.now(),
                  },
                },
              }
            : w,
        ),
      ); // end setWidgets
      if (setMemos) {
        setMemos((prev) =>
          prev.map((m) =>
            m.id === memoId
              ? {
                  ...m,
                  imageUrl: base64Str,
                  updatedAt: Date.now(),
                }
              : m,
          ),
        );
      }
    };
    reader.readAsDataURL(file);
  }; // end handleImageUpload

  const handleDeleteImg = () => {
    const memoId = widget.data?.memo?.id;
    setWidgets((prev) =>
      prev.map((w) =>
        w.id === widget.id && w.data?.memo
          ? {
              ...w,
              data: {
                ...w.data,
                memo: {
                  ...w.data.memo,
                  imageUrl: undefined,
                  updatedAt: Date.now(),
                },
              },
            }
          : w,
      ),
    ); // end setWidgets

    if (setMemos && memoId) {
      setMemos((prev) =>
        prev.map((m) =>
          m.id === memoId
            ? {
                ...m,
                imageUrl: undefined,
                updatedAt: Date.now(),
              }
            : m,
        ),
      );
    }
  }; // end handleDeleteImg
  // ClipboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement> 어느 태그
  const handlePaste = (
    e: ClipboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement>,
  ) => {
    const items = e.clipboardData?.items;
    if (!items) {
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();

        if (!file) {
          continue;
        }
        e.preventDefault(); //text area 에 파일 명이 들어가는 것 방지

        const reader = new FileReader();

        reader.onloadend = () => {
          const base64Str = reader.result as string;
          const memoId = widget.data?.memo?.id || `memo_${crypto.randomUUID()}`;

          const now = widget.data?.memo?.createdAt || Date.now();
          setWidgets((prev) =>
            prev.map((w) =>
              String(w.id) === String(widget.id)
                ? {
                    ...w,
                    data: {
                      ...w.data,
                      memo: {
                        ...(w.data?.memo || {
                          id: memoId,
                          createdAt: Date.now(),
                          memoText: w.data?.memo?.memoText || "",
                        }),
                        imageUrl: base64Str,
                        updatedAt: Date.now(),
                      },
                    },
                  }
                : w,
            ),
          ); // end setWidgets

          if (setMemos) {
            setMemos((prev) => {
              const exists = prev.some((m) => m.id === memoId);

              if (exists) {
                return prev.map((m) =>
                  m.id === memoId
                    ? {
                        ...m,
                        imageUrl: base64Str,
                        updatedAt: Date.now(),
                      }
                    : m,
                );
              }
              return [
                ...prev,
                {
                  id: memoId,
                  title: widget.data?.memo?.title || "",
                  memoText: widget.data?.memo?.memoText || "",
                  imageUrl: base64Str,
                  createdAt: now,
                  updatedAt: Date.now(),
                },
              ];
            }); //setMemos
          }
          // return [
          //   ...prev,
          //   {
          //     id: memoId,
          //     title: widget.data?.memo?.title || "",
          //     memoText: widget.data?.memo?.memoText || "",
          //     imageUrl: base64Str,
          //     createdAt: now,
          //     updatedAt: Date.now(),
          //   },
          // ];
        }; //end onloadend

        reader.readAsDataURL(file);
        break;
      }
    } //end for
  }; //end handlePaste
  return (
    <div className="memo-widget-container" tabIndex={0} onPaste={handlePaste}>
      {/**이미지 영역 */}
      {widget.data?.memo?.imageUrl && (
        <div className="memo-img-wrapper">
          <img src={widget.data.memo.imageUrl} className="memo-img-image" />
          <button className="memo-img-del-btn" onClick={handleDeleteImg}>
            X
          </button>
        </div>
      )}
      {currentMode === "minimal-frame" && !widget.data?.memo?.imageUrl && (
        <div className="memo-frame-empty-placeholder">
          <span>이미지를 추가해주세요.</span>
        </div>
      )}
      <textarea
        name=""
        id=""
        value={widget.data?.memo?.memoText || ""}
        onChange={(e) => handleTextChange(e)}
        placeholder="메모를 입력하세요"
        onMouseDown={(e) => e.stopPropagation()} //그리드보드에서 드래그 이벤트가 발생하지 않도록 방지
        onDragStart={
          (e) => {
            e.preventDefault();
            e.stopPropagation();
          } //그리드보드에서 드래그 이벤트가 발생하지 않도록 방지
        } //그리드보드에서 드래그 이벤트가 발생하지 않도록 방지
        tabIndex={0}
        onPaste={handlePaste}
        className="memo-widget-textarea"
      ></textarea>

      {/**footer */}
      <div className="memo-widget-footer-container">
        <button
          className={`memo-folder-tab ${isFooterOpen ? "open" : ""}`}
          onClick={() => setIsFooterOpen((prev) => !prev)}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {isFooterOpen ? "접기 ▼" : "열기 ▲"}
        </button>
        {isFooterOpen && (
          <div className="memo-widget-footer">
            <label
              className="memo-widget-label"
              htmlFor={`file-input-${widget.id}`}
              onMouseDown={(e) => e.stopPropagation()}
            >
              이미지 첨부
            </label>
            <input
              id={`file-input-${widget.id}`}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            {/**토글 */}
            <div
              className="memo-view-mode-group"
              style={{ display: "flex", gap: "8px", fontSize: "12px" }}
            >
              <label>
                <input
                  type="radio"
                  name={`view-mode-${widget.id}`}
                  value="normal"
                  checked={currentMode === "normal"}
                  onChange={() => handleModeChange("normal")}
                />
                일반
              </label>
              <label>
                <input
                  type="radio"
                  name={`view-mode-${widget.id}`}
                  value="minimal-frame"
                  checked={currentMode === "minimal-frame"}
                  onChange={() => handleModeChange("minimal-frame")}
                />{" "}
                액자
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; //MemoWidget

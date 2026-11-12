import react, { useState, useMemo, useRef } from "react";
import "../../assets/styles/Memo.css";

import type { MemoViewMode, MemoWidgetProps } from "../../types/dashboard.ts";
import type { ChangeEvent, ClipboardEvent } from "react";
import { memoApi } from "../../api/memoApi.ts";
import { widgetApi } from "../../api/widgetApi.ts";
import debounce from "lodash-es/debounce";
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
    const updatedWidget = { ...widget, viewMode: mode };
    setWidgets((prev) =>
      prev.map((w) => (w.id === widget.id ? { ...w, viewMode: mode } : w)),
    );
    widgetApi.createWidget(updatedWidget).catch((err) => {
      console.error("메모 뷰모드 저장 실패:", err);
    });
  };

  const handleTextChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    // field: "title" | "memoText",
  ) => {
    const newText = e.target.value;
    const memoId = widget.data?.memo?.id;

    if (!memoId) return;

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
          return prevMemos.map((m) =>
            String(m.id) === String(memoId)
              ? {
                  ...m,
                  memoText: newText,
                }
              : m,
          );
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
    debounceTimeRef.current(memoId, "memoText", newText);
  }; //handleTextChange

  const debounceTimeRef = useRef(
    debounce(async (id: string, filed: "title" | "memoText", value: string) => {
      try {
        await memoApi.updateMemo(id, { [filed]: value });
      } catch (err) {
        console.error(err, "디바운스 에러");
      }
    }, 500),
  );
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    const memoId = widget.data?.memo?.id;
    if (!file || !memoId) {
      return;
    }

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Str = reader.result as string;
      setWidgets((prev) =>
        prev.map(
          (w) => {
            if (String(w.id) === String(widget.id)) {
              if (!w.data?.memo) return w;

              return {
                ...w,
                data: {
                  ...w.data,
                  memo: {
                    ...w.data.memo,
                    id: memoId,
                    imageUrl: base64Str,
                  },
                },
              };
            }
            return w;
          }, //end prev.map
        ),
      );

      if (setMemos) {
        setMemos((prev) =>
          prev.map((m) =>
            m.id === memoId
              ? {
                  ...m,
                  imageUrl: base64Str,
                  // updatedAt: Date.now(),
                }
              : m,
          ),
        ); // end
      }

      try {
        await memoApi.updateMemo(memoId, { imageUrl: base64Str });
      } catch (err) {
        console.error(err, " 이미지 업로드 실패");
      }
    }; //end load
    reader.readAsDataURL(file);
  }; // end handleImageUpload

  const handleDeleteImg = async () => {
    const memoId = widget.data?.memo?.id;

    if (!memoId) return;

    if (setMemos && memoId) {
      setMemos((prev) =>
        prev.map((m) =>
          m.id === memoId
            ? {
                ...m,
                imageUrl: undefined,
              }
            : m,
        ),
      );
    }
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
                },
              },
            }
          : w,
      ),
    ); // end setWidgets

    try {
      await memoApi.updateMemo(memoId, { imageUrl: null as any });
    } catch (err) {
      console.error(err);
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

    const memoId = widget.data?.memo?.id;
    if (!memoId) {
      alert("문제가 발생하였습니다.");
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

        reader.onloadend = async () => {
          const base64Str = reader.result as string;

          const updatedMemo = {
            ...widget.data?.memo,
            id: memoId,
            imageUrl: base64Str,
          };

          setWidgets((prev) =>
            prev.map((w) =>
              String(w.id) === String(widget.id)
                ? {
                    ...w,
                    data: {
                      ...w.data,
                      memo: updatedMemo,
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
                    }
                  : m,
              ),
            ); //setMemos

            // 로컬스토리지 사용하지 않기 때문에 수정
            // setMemos((prev) => {
            //   const exists = prev.some((m) => m.id === memoId);
            //   if (exists) {
            //     return prev.map((m) =>
            //       m.id === memoId
            //         ? {
            //             ...m,
            //             imageUrl: base64Str,
            //             // updatedAt: Date.now(),
            //           }
            //         : m,
            //     );
            //   }
            //   return [
            //     ...prev,
            //     {
            //       id: memoId,
            //       title: widget.data?.memo?.title || "",
            //       memoText: widget.data?.memo?.memoText || "",
            //       imageUrl: base64Str,
            //       createdAt: now,
            //       updatedAt: Date.now(),
            //     },
            //   ];
            // }); //setMemos
          }

          //db 반영
          try {
            await memoApi.updateMemo(memoId, {
              title: widget.data?.memo?.title || "",
              memoText: widget.data?.memo?.memoText || "",
              imageUrl: base64Str,
            });
          } catch (err) {
            console.error("오류가 발생하였습니다.", err);
          }
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

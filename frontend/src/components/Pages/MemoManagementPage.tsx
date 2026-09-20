import { useState, useMemo, memo, type ChangeEvent } from "react";
import {
  type MemoItem,
  type Widget,
  type MemoWidgetProps,
  DEFAULT_SIZES,
  DEFAULT_POSITION,
  type DashboardSharedProps,
} from "../../types/dashboard";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/MemoManagement.css";
import { paginate } from "../../utils/pagination";
interface MemoManagementPageProps {
  widgets: Widget[];
  setWidgets: React.Dispatch<React.SetStateAction<Widget[]>>;
  memos: MemoItem[];
  setMemos?: React.Dispatch<React.SetStateAction<MemoItem[]>>;
}
export const MemoManagementPage = ({
  widgets,
  setWidgets,
  memos,
  setMemos,
}: MemoManagementPageProps) => {
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  const [activeMemoId, setActiveMemoId] = useState("");
  //datepicker 사용 시 쓸 예정
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const navigator = useNavigate();

  const [currentPage, setCurrentPage] = useState<number>(1);

  //flag 역할
  const [onlyWithImg, setOnlyWithImg] = useState<boolean>(false);

  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null);

  //검색

  const filteredMemos = useMemo(() => {
    if (!memos) return [];

    return memos
      ?.filter((m) => {
        const matchedSearch =
          m.title?.toLowerCase().includes(searchKeyword.toLocaleLowerCase()) ||
          m.memoText?.toLowerCase().includes(searchKeyword.toLocaleLowerCase());
        const memoDateStr = new Date(m.createdAt ?? Date.now())
          .toISOString()
          .split("T")[0];

        const matchesStartDate = !startDate || memoDateStr >= startDate;
        const matchesEndDate = !endDate || memoDateStr <= endDate;

        // flag 가 ture라면 실제 img의 유무를 확인하여 필터링
        const matchesImgFilter = !onlyWithImg || !!m.imageUrl;

        return (
          matchedSearch &&
          matchesEndDate &&
          matchesStartDate &&
          matchesImgFilter
        );
      })
      .sort((a, b) => (b.updatedAt ?? 0) - (a.createdAt ?? 0));
  }, [memos, searchKeyword, startDate, endDate, onlyWithImg]); //filteredMemos

  const selectedMemos = useMemo(() => {
    return memos?.find((m) => m.id === activeMemoId) || null;
  }, [memos, activeMemoId]);

  const handleCreateNewMemo = () => {
    const now = Date.now();
    const newMemoId = `memo_${crypto.randomUUID()}`;
    const newMemo: MemoItem = {
      id: newMemoId,
      title: "",
      memoText: "",
      createdAt: now,
      updatedAt: now,
    };

    if (setMemos) {
      setMemos((prev) => [newMemo, ...prev]);
    }

    setActiveMemoId(newMemoId);
  };

  const handleUpdateMemo = (field: "title" | "memoText", value: string) => {
    if (!activeMemoId || !setMemos) return;

    const now = Date.now();

    console.log();
    setMemos((prev) =>
      prev.map((m) =>
        m.id === activeMemoId
          ? {
              ...m,
              [field]: value,
              updatedAt: now,
            }
          : m,
      ),
    );
    console.log(activeMemoId, "activeMemoId");
    setWidgets((prev) =>
      prev.map((w) => {
        if (w.type === "memo" && w.data?.memo?.id === activeMemoId) {
          return {
            ...w,
            data: {
              memo: {
                ...w.data.memo,
                [field]: value,
                updatedAt: now,
              },
            },
          };
        }

        return w;
      }),
    );
  }; //handleUpdateMemo

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeMemoId) return;
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64Str = reader.result as string;
      const now = Date.now();

      if (setMemos) {
        setMemos((prev) =>
          prev.map((m) =>
            String(m.id) === String(activeMemoId)
              ? { ...m, imageUrl: base64Str, updatedAt: now }
              : m,
          ),
        );
      } //end

      setWidgets((prev) =>
        prev.map((w) => {
          if (
            w.type === "memo" &&
            w.data?.memo &&
            String(w.data?.memo?.id) === String(activeMemoId)
          ) {
            return {
              ...w,
              data: {
                ...w.data,
                memo: {
                  ...w.data?.memo,
                  imageUrl: base64Str,
                  updatedAt: now,
                },
              },
            };
          }
          return w;
        }),
      );
    };
    reader.readAsDataURL(file);
  };

  const handlePasteImage = (
    e: React.ClipboardEvent<HTMLTextAreaElement | HTMLDivElement>,
  ) => {
    const items = e.clipboardData?.items;

    if (!items || !activeMemoId) {
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();

        if (!file) {
          continue;
        }

        e.preventDefault();

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Str = reader.result as string;
          const now = Date.now();

          if (setMemos) {
            setMemos((prev) =>
              prev.map((m) =>
                m.id === activeMemoId
                  ? { ...m, imageUrl: base64Str, updatedAt: now }
                  : m,
              ),
            );
          } //end if

          setWidgets((prev) =>
            prev.map((w) => {
              if (w.type === "memo" && w.data?.memo?.id === activeMemoId) {
                return {
                  ...w,
                  data: {
                    ...w.data,
                    memo: {
                      ...w.data.memo,
                      imageUrl: base64Str,
                      updatedAt: now,
                    },
                  },
                };
              } //end

              return w;
            }),
          );
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const handleOnlyImg = () => {};
  const handleDeleteImage = () => {
    const now = Date.now();
    if (!activeMemoId) {
      return;
    }

    if (setMemos) {
      setMemos((prev) =>
        prev.map((m) =>
          m.id === activeMemoId
            ? {
                ...m,
                imageUrl: undefined,
                updatedAt: now,
              }
            : m,
        ),
      );
    } //end if

    setWidgets((prev) =>
      prev.map((w) => {
        if (w.type === "memo" && w.data?.memo?.id === activeMemoId) {
          return {
            ...w,
            data: {
              ...w.data,
              memo: {
                ...w.data.memo,
                imageUrl: undefined,
                updatedAt: now,
              },
            },
          };
        }
        return w;
      }),
    );
  };

  const handleToggleDashboardWidget = (memo: MemoItem) => {
    const isAlreadyOnDashboard = widgets.some(
      (w) => w.type === "memo" && w.data?.memo?.id === memo.id,
    );

    if (isAlreadyOnDashboard) {
      setWidgets((prev) =>
        prev.filter(
          (w) => !(w.type === "memo" && w.data?.memo?.id === memo.id),
        ),
      );
    } else {
      const now = Date.now();
      const { w, h } = DEFAULT_SIZES.memo;
      const newWidget: Widget = {
        w: w,
        h: h,
        x: DEFAULT_POSITION.x,
        y: DEFAULT_POSITION.y,
        viewMode: "normal",
        id: `widget_${now}`,
        type: "memo",
        data: {
          memo: {
            id: memo.id,
            title: memo.title,
            memoText: memo.memoText,
            imageUrl: memo.imageUrl,
            createdAt: memo.createdAt,
            updatedAt: memo.updatedAt,
          },
        },
      };

      setWidgets((prev) => [...prev, newWidget]);
    }
  };

  // const filteredMemos = useMemo(() => {
  //   if (!memos) return [];
  //   return memos
  //     ?.filter((m) => {
  //       const matchesSearch =
  //         searchKeyword.trim() === "" ||
  //         (m.title &&
  //           m.title.toLowerCase().includes(searchKeyword.toLowerCase())) ||
  //         m.memoText.toLowerCase().includes(searchKeyword.toLowerCase());

  //       const memoDateStr = new Date(m.createdAt).toISOString().split("T")[0];
  //       const matchesStartDate = !startDate || memoDateStr >= startDate;
  //       const matchesEndDate = !endDate || memoDateStr <= endDate;

  //       return matchesSearch && matchesStartDate && matchesEndDate;
  //     })
  //     .sort((a, b) => b.createdAt - a.createdAt);
  // }, [memos, searchKeyword, startDate, endDate]);

  //페이징

  const {
    currentItems: currentMemos,
    totalPages,
    pageNumbers,
    hasNext,
    hasPrev,
  } = useMemo(() => {
    return paginate(filteredMemos, currentPage, 6);
  }, [filteredMemos, currentPage]);
  const resetFilters = () => {
    setSearchKeyword("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    setOnlyWithImg(false);
  };

  const handleDeleteMemo = (memoId: String) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    if (setMemos) {
      setMemos((prev) => prev.filter((m) => m.id !== memoId));
    }

    //memo데이터가 없을 수 있으므로 옵셔널체이닝
    setWidgets((prev) => prev.filter((w) => w.data?.memo?.id === memoId));
    if (selectedMemoId === memoId) {
      setSelectedMemoId(null);
    } //삭제된 후 selectedMemoId가 빈 상태로 자동으로 변경되지 않기 때문에 추가
  };
  return (
    <div className="memo-manager-container">
      {/* 상단 헤더 네비게이션 */}
      <header className="memo-manager-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigator("/")}>
            &larr; 대시보드로 복귀
          </button>
          <h2>메모 보관함</h2>
        </div>
        <button className="create-memo-btn" onClick={handleCreateNewMemo}>
          + 새 메모 생성
        </button>
      </header>

      <div
        className="memo-manager-body"
        tabIndex={0}
        onPaste={handlePasteImage}
      >
        {/* 좌측: 메모 목록 및 검색 사이드바 */}
        <aside className="memo-list-sidebar">
          <div className="memo-search-wrapper">
            <input
              type="text"
              placeholder="검색"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setCurrentPage(1);
              }}
              className="memo-search-input"
            />
            <div className="memo-date-filter-group">
              <input
                type="date"
                name=""
                id=""
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                value={startDate}
                title="시작일"
                className="memo-date-input"
              />
              <span className="divider">~</span>
              <input
                className="memo-date-input"
                type="date"
                value={endDate}
                title="죵료일"
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="memo-search-filter-control">
              <button
                type="button"
                onClick={resetFilters}
                className="memo-search-reset"
              >
                reset
              </button>
              <label className="memo-search-img-only">
                <input
                  type="checkbox"
                  checked={onlyWithImg}
                  onChange={(e) => {
                    setOnlyWithImg(e.target.checked);
                    setCurrentPage(1);
                  }}
                  onClick={handleOnlyImg}
                />
                이미지만 보기
              </label>
            </div>
          </div>

          <div className="memo-items-scroll">
            {currentMemos.map((memo) => {
              const isOnDashboard = widgets.some(
                (w) => w.type === "memo" && w.data?.memo?.id === memo.id,
              );

              return (
                <div
                  key={memo.id}
                  className={`memo-list-card ${activeMemoId === memo.id ? "active" : ""}`}
                  onClick={() => setActiveMemoId(memo.id)}
                >
                  <div className="card-top">
                    <h4 className="card-title">
                      {memo.title?.trim() ? memo.title : "제목 없는 메모"}
                    </h4>
                    {isOnDashboard && (
                      <span className="badge-dashboard">대시보드 노출중</span>
                    )}
                  </div>
                  <p className="card-preview">
                    {memo.memoText.trim() ? memo.memoText : "내용 없음"}
                  </p>
                  <span className="card-date">
                    {new Date(
                      memo.updatedAt ?? Date.now(),
                    ).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
            {filteredMemos.length === 0 && (
              <div className="empty-memo-msg">표시할 메모가 없습니다.</div>
            )}
          </div>

          {/**페이징 */}
          <div className="pagination-bar">
            <button
              type="button"
              className="page-nav-btn"
              disabled={!hasPrev}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              &lt;
            </button>
            {pageNumbers.map((num) => (
              <button
                key={num}
                type="button"
                className={`page-num-btn ${currentPage === num ? "active" : ""}`}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              className="page-nav-btn"
              disabled={!hasNext}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              &gt;
            </button>
          </div>
        </aside>

        {/* 우측: 상세 편집 뷰 */}
        <main className="memo-editor-main">
          {selectedMemos ? (
            <div className="editor-inner">
              <div className="editor-control-bar">
                <label
                  htmlFor="memo-image-file-input"
                  className="image-upload-btn"
                >
                  이미지 첨부
                </label>
                <input
                  type="file"
                  id="memo-image-file-input"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />

                <button
                  className={`toggle-widget-btn ${
                    widgets.some(
                      (w) =>
                        w.type === "memo" &&
                        w.data?.memo?.id === selectedMemos.id,
                    )
                      ? "pinned"
                      : ""
                  }`}
                  onClick={() => handleToggleDashboardWidget(selectedMemos)}
                >
                  {widgets.some(
                    (w) =>
                      w.type === "memo" &&
                      w.data?.memo?.id === selectedMemos.id,
                  )
                    ? "📌 대시보드에서 내리기"
                    : "➕ 대시보드 위젯으로 추가"}
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteMemo(selectedMemos.id)}
                >
                  메모 영구 삭제
                </button>
              </div>
              {/**image area */}
              {selectedMemos.imageUrl && (
                <div className="memo-editor-image-preview">
                  <img src={selectedMemos.imageUrl} alt="첨부 이미지" />
                  <button
                    className="memo-editor-image-del-btn"
                    type="button"
                    onClick={handleDeleteImage}
                  >
                    ✕ 이미지 제거
                  </button>
                </div>
              )}
              <input
                type="text"
                className="editor-title-input"
                value={selectedMemos.title}
                onChange={(e) => handleUpdateMemo("title", e.target.value)}
                placeholder="제목을 입력하세요..."
              />

              <textarea
                className="editor-textarea"
                value={selectedMemos.memoText}
                onChange={(e) => handleUpdateMemo("memoText", e.target.value)}
                placeholder="내용을 작성하세요..."
                onPaste={handlePasteImage}
              />
            </div>
          ) : (
            <div className="no-selection-msg">
              좌측 목록에서 메모를 선택하거나 새 메모를 생성해 주세요.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

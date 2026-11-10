import React, {
  useState,
  useMemo,
  type ChangeEvent,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  type MemoItem,
  type Widget,
  DEFAULT_SIZES,
  DEFAULT_POSITION,
} from "../../types/dashboard";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/MemoManagement.css";

import { memoApi } from "../../api/memoApi";

import { Pagination } from "../Pagination";
import debounce from "lodash-es/debounce";
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

  const [selectedMemo, setSelectedMemo] = useState<MemoItem | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  const [totalPage, setTotalPage] = useState<number>(1);

  const loadMemos = async (currentPage: number, query: string) => {
    try {
      setLoading(true);

      // const response = await client.get<MemoItem[]>("/memos");
      const response = await memoApi.getMemos({
        page: currentPage,
        limit: 6,
        search: query,
      });

      if (response?.items) {
        setMemos?.(response.items);
        setTotalPage(response.pagination.totalPage || 1);
      }

      setMemos?.(response.items ?? response);
    } catch (err) {
      console.error(err, " 메모 데이터 호출 오류");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMemo = async (memoId: string) => {
    setActiveMemoId(memoId);
    try {
      const response = await memoApi.getMemoById(memoId);
      setSelectedMemo(response);
    } catch (err) {
      console.error(err, "메모 상세 조회 실패");
    }
  };

  // const selectedMemos = useMemo(() => {
  //   return memos?.find((m) => m.id === activeMemoId) || null;
  // }, [memos, activeMemoId]);

  const debounceSearch = useCallback(
    debounce((query: string) => {
      setCurrentPage(1);
      loadMemos(1, query);
    }, 100),
    [],
  );

  useEffect(() => {
    loadMemos(currentPage, searchKeyword);
  }, [currentPage]);

  const handleSearchMemo = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchKeyword(value);
    debounceSearch(value);
  };

  const handleCreateNewMemo = async () => {
    try {
      const response = await memoApi.createMemo({
        title: "",
        memoText: "",
      });

      const newMemo = response.data.data as MemoItem;

      const getRes = await memoApi.getMemos();
      const updatedMemos = getRes.items ?? getRes;
      setMemos?.(updatedMemos);

      if (newMemo?.id) {
        setActiveMemoId(newMemo.id);

        setCurrentPage(1);
        await loadMemos(1, "");
      }
    } catch (err) {
      console.error(err, "메모 생성 오류");
      alert("메모 작성 중 오류가 발생하였습니다.");
    }
  };

  const debounceTimeRef = useRef(
    debounce(async (id: string, filed: "title" | "memoText", value: string) => {
      try {
        await memoApi.updateMemo(id, { [filed]: value });
      } catch (err) {
        console.error(err, "디바운스 에러");
      }
    }, 500),
  );

  const handleUpdateMemo = (field: "title" | "memoText", value: string) => {
    if (!activeMemoId || !setMemos) return;

    setMemos((prev) =>
      prev.map((m) =>
        m.id === activeMemoId
          ? {
              ...m,
              [field]: value,
            }
          : m,
      ),
    );

    setWidgets((prev) =>
      prev.map((w) => {
        if (w.type === "memo" && w.data?.memo?.id === activeMemoId) {
          return {
            ...w,
            data: {
              memo: {
                ...w.data.memo,
                [field]: value,
              },
            },
          };
        }

        return w;
      }),
    );

    debounceTimeRef.current(activeMemoId, field, value);
  }; //handleUpdateMemo

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeMemoId) return;
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Str = reader.result as string;

      if (setMemos) {
        setMemos((prev) =>
          prev.map((m) =>
            String(m.id) === String(activeMemoId)
              ? { ...m, imageUrl: base64Str }
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
                },
              },
            };
          }
          return w;
        }),
      ); //setWidget

      try {
        await memoApi.updateMemo(activeMemoId, { imageUrl: base64Str });
      } catch (err) {
        console.error(err, " 이미지 업로드 실패");
      }
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
        reader.onloadend = async () => {
          const base64Str = reader.result as string;

          if (setMemos) {
            setMemos((prev) =>
              prev.map((m) =>
                m.id === activeMemoId ? { ...m, imageUrl: base64Str } : m,
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
                    },
                  },
                };
              } //end

              return w;
            }),
          ); //setWidget
          try {
            await memoApi.updateMemo(activeMemoId, { imageUrl: base64Str });
          } catch (err) {
            console.error(err, "paste 실패");
          }
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const handleOnlyImg = () => {};
  const handleDeleteImage = async () => {
    if (!activeMemoId) {
      return;
    }

    if (setMemos) {
      setMemos((prev) =>
        prev.map((m) =>
          m.id === activeMemoId
            ? {
                ...m,
                imageUrl: null as any,
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
                imageUrl: null as any,
              },
            },
          };
        }
        return w;
      }),
    ); //end setWidget
    try {
      await memoApi.updateMemo(activeMemoId, { imageUrl: null as any });
    } catch (err) {
      console.error(err, "이미지 삭제 실패");
    }
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

  // const {
  //   currentItems: currentMemos,
  //   totalPages,
  //   pageNumbers,
  //   hasNext,
  //   hasPrev,
  // } = useMemo(() => {
  //   return paginate(filteredMemos, currentPage, 6);
  // }, [filteredMemos, currentPage]);
  const resetFilters = () => {
    setSearchKeyword("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    setOnlyWithImg(false);
  };

  const handleDeleteMemo = async (memoId: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    if (setMemos) {
      setMemos((prev) => prev.filter((m) => m.id !== memoId));
    }

    try {
      await memoApi.deleteMemo(memoId);
      alert("삭제되었습니다.");
      //memo데이터가 없을 수 있으므로 옵셔널체이닝
      setWidgets((prev) =>
        prev.filter((w) => w.type === "memo" && w.data?.memo?.id === memoId),
      );
      if (selectedMemo?.id === memoId) {
        setActiveMemoId("");
        setSelectedMemo(null);
      } //삭제된 후 selectedMemoId가 빈 상태로 자동으로 변경되지 않기 때문에 추가

      const isLastItemOnPage = memos.length === 1 && currentPage > 1;
      const targetPage = isLastItemOnPage ? currentPage - 1 : currentPage;

      if (isLastItemOnPage) {
        setCurrentPage(targetPage);
      }
      await loadMemos(targetPage, searchKeyword);
    } catch (err) {
      console.error(err, " 메모 삭제 실패");
    }
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
              // onChange={(e) => {
              //   setSearchKeyword(e.target.value);
              //   setCurrentPage(1);
              // }}
              onChange={handleSearchMemo}
              //handleSearchMemo
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
            {/* {currentMemos.map((memo) => {
              const isOnDashboard = widgets.some(
                (w) => w.type === "memo" && w.data?.memo?.id === memo.id,
              ); */}
            {memos.map((memo) => {
              const isOnDashboard = widgets.some(
                (w) => w.type === "memo" && w.data?.memo?.id === memo.id,
              );
              return (
                <div
                  key={memo.id}
                  className={`memo-list-card ${activeMemoId === memo.id ? "active" : ""}`}
                  onClick={() => handleSelectMemo(memo.id)}
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
            {memos.length === 0 && (
              <div className="empty-memo-msg">표시할 메모가 없습니다.</div>
            )}
          </div>
          {/**페이징 */}
          <div className="pagination-bar">
            {/* <button
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
            </button> */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPage}
              onPageChange={(newPage) => setCurrentPage(newPage)}
            />
          </div>
        </aside>

        {/* 우측: 상세 편집 뷰 */}
        <main className="memo-editor-main">
          {selectedMemo ? (
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
                        w.data?.memo?.id === selectedMemo.id,
                    )
                      ? "pinned"
                      : ""
                  }`}
                  onClick={() => handleToggleDashboardWidget(selectedMemo)}
                >
                  {widgets.some(
                    (w) =>
                      w.type === "memo" && w.data?.memo?.id === selectedMemo.id,
                  )
                    ? "📌 대시보드에서 내리기"
                    : "➕ 대시보드 위젯으로 추가"}
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteMemo(selectedMemo.id)}
                >
                  메모 영구 삭제
                </button>
              </div>
              {/**image area */}
              {selectedMemo.imageUrl && (
                <div className="memo-editor-image-preview">
                  <img src={selectedMemo.imageUrl} alt="첨부 이미지" />
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
                value={selectedMemo.title}
                onChange={(e) => handleUpdateMemo("title", e.target.value)}
                placeholder="제목을 입력하세요..."
              />

              <textarea
                className="editor-textarea"
                value={selectedMemo.memoText}
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

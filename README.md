# Grid Dashboard

12컬럼 CSS Grid 기반의 커스터마이징 대시보드 및 개인 일정·메모 통합 관리 웹 애플리케이션입니다. 
프론트엔드 상태와 백엔드 관계형 데이터베이스(MySQL) 간의 실시간 동기화를 통해 위젯의 배치, 크기, 뷰 모드, 일정 및 메모 데이터를 영속적으로 관리합니다.

---

## 주요 기능

### 1. 그리드 대시보드 (`GridBoard`)
* **드래그 앤 드롭 배치 및 리사이징**: 12컬럼 그리드 내에서 위젯의 좌표(`x`, `y`) 이동 및 크기(`w`, `h`) 조절을 지원하며, 변경 즉시 DB에 반영됩니다.
* **위젯 라이브러리**: 사이드바에서 플래너(할 일/D-Day/캘린더), 날씨, 시계, 날씨/시계 통합 위젯을 대시보드로 드래그하여 생성할 수 있습니다.
* **z-index 포커싱**: 위젯 클릭 또는 드래그 시 선택된 위젯이 최상단으로 정렬됩니다.

### 2. 멀티 모드 플래너 위젯 (`TodosWidget`)
* **모드 전환 및 상태 유지**: 단일 위젯 내에서 `할 일(todos)`, `D-Day(dday)`, `캘린더(mini-calendar)` 모드를 전환할 수 있으며, 선택한 모드는 DB(`widgets.mode`)에 저장되어 새로고침 후에도 유지됩니다.
* **반복 및 기간 일정 처리**: 날짜별 완료 이력(`completedDates`) 토글 및 D-Day 카운트다운 계산을 지원합니다.

### 3. 메모 보관함 및 위젯 연동 (`MemoManagementPage` / `MemoWidget`)
* **실시간 양방향 동기화**: 메모 보관함 에디터와 대시보드 내 동일 메모 위젯 간의 제목, 본문, 첨부 이미지가 실시간으로 동기화됩니다.
* **Debounce 자동 저장**: 텍스트 입력 시 불필요한 API 호출을 방지하기 위해 500ms 디바운싱을 적용하여 백엔드 DB에 자동 반영합니다.
* **이미지 첨부 및 클립보드 붙여넣기**: 파일 업로드 및 `Ctrl + V` 클립보드 이미지 붙여넣기를 지원하며, 위젯 뷰 모드(`normal` / `minimal-frame`) 전환이 가능합니다.
* **검색 및 필터링**: 키워드 디바운스 검색과 서버 사이드 페이지네이션을 지원합니다.

### 4. 전체 일정 관리 (`CalendarPage`)
* **FullCalendar 연동**: 월간 뷰 기준 조회 구간(`start`, `end`)에 해당하는 일정을 동적으로 로드합니다.
* **일정 CRUD 모달**: 날짜 클릭을 통한 신규 일정·D-Day 등록 및 기존 일정 수정·삭제 기능을 제공합니다.

---

## 기술 스택

| 구분 | 기술 |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, React Router |
| **UI / Calendar** | CSS Grid, FullCalendar (`daygrid`, `interaction`), React Datepicker, date-fns |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MySQL (`widgets`, `memos`, `tasks`) |
| **Deployment** | Vercel |

---

## 데이터베이스 스키마 구조

* **`widgets`**: 대시보드 위젯 메타데이터 관리 (`id`, `type`, `x`, `y`, `w`, `h`, `view_mode`, `mode`, `data`, `updated_at`)
* **`memos`**: 메모 본문 및 이미지 데이터 관리 (`id`, `title`, `memo_text`, `image_url`, `created_at`, `updated_at`)
* **`tasks`**: 일반 일정, 기간 일정, D-Day 및 완료 날짜 이력 관리 (`id`, `title`, `content`, `start_date`, `due_date`, `is_dday`, `status`, `completed_dates`)

---

## 프로젝트 구조

```text
dashboard-workspace/
├── frontend/
│   └── src/
│       ├── api/             # Axios 기반 백엔드 API 통신 모듈 (widgetApi, memoApi, taskApi)
│       ├── assets/styles/   # 컴포넌트별 CSS 스타일시트
│       ├── components/      # GridBoard, Sidebar, CalendarPage, MemoManagementPage 등
│       │   ├── modals/      # 일정 등록/수정 모달 (TodoModal)
│       │   └── widgets/     # 개별 위젯 컴포넌트 (Todos, Memo, Clock, Weather)
│       └── types/           # 공통 TypeScript 인터페이스 및 DTO 정의
└── backend/                 # Express REST API 서버 및 MySQL 연동 컨트롤러

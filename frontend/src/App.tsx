import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import type { Widget, TaskItem, MemoItem } from "./types/dashboard.ts";
import { GridBoard } from "./components/Pages/GridBoard.tsx";
import { CalendarPage } from "./components/Pages/CalendarPage.tsx";
import { MemoManagementPage } from "./components/Pages/MemoManagementPage.tsx";
import "./App.css";
import "./assets/styles/Layout.css";
import { Routes, Route } from "react-router-dom";
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const [widgets, setWidgets] = useState<Widget[]>(() => {
    try {
      const savedWidget = localStorage.getItem("myDashboard_widgets");
      return savedWidget ? JSON.parse(savedWidget) : [];
    } catch (err) {
      console.error(err, " widget date get error");
    }
  });

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  /**2026.08.08. 로컬스토리지 작업 */
  const [globalTasks, setGlobalTasks] = useState<TaskItem[]>(() => {
    try {
      const savedTask = localStorage.getItem("myDashboard_task");
      return savedTask ? JSON.parse(savedTask) : [];
    } catch (error) {
      console.error("error:", error);
      return [];
    }
  });

  const [memos, setMemos] = useState<MemoItem[]>(() => {
    try {
      const savedMemo = localStorage.getItem("myDashboard_memo");
      return savedMemo ? JSON.parse(savedMemo) : [];
    } catch (err) {
      console.error(err, " memo get error");
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("myDashboard_widgets", JSON.stringify(widgets));
    } catch (err) {
      console.error(err, " errer");
    }
  }, [widgets]);
  /**task 저장 */
  useEffect(() => {
    try {
      localStorage.setItem("myDashboard_task", JSON.stringify(globalTasks));
    } catch (err) {
      console.error("localStorage error", err);
    }
  }, [globalTasks]);

  /**메모 저장 */
  useEffect(() => {
    try {
      localStorage.setItem("myDashboard_memo", JSON.stringify(memos));
    } catch (err) {
      console.error(err, " memo error");
    }
  }, [memos]);

  // useEffect(() => []);
  return (
    <div className="app-container">
      <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-wrapper">
        <Sidebar
          isOpen={isSidebarOpen}
          setWidgets={setWidgets}
          widgets={widgets}
          memos={memos}
        />

        <main className="grid-container-wrapper">
          {/**route branch */}
          <Routes>
            <Route
              path="/"
              element={
                <GridBoard
                  widgets={widgets}
                  setWidgets={setWidgets}
                  tasks={globalTasks}
                  setTasks={setGlobalTasks}
                  memos={memos}
                  setMemos={setMemos}
                />
              }
            ></Route>
            <Route
              path="/calendar"
              element={
                <CalendarPage tasks={globalTasks} setTasks={setGlobalTasks} />
              }
            ></Route>{" "}
            <Route
              path="/memos"
              element={
                <MemoManagementPage
                  widgets={widgets}
                  setWidgets={setWidgets}
                  memos={memos}
                  setMemos={setMemos}
                />
              }
            ></Route>
            {/**그리드보드가 위젯 정보를 갖고 있으므로 캘린더는 위젯 관련 정보를 넘겨받을 필요 없이 task info 만 갖고 있으면 됨*/}
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;

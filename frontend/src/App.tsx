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
import { widgetApi } from "./api/widgetApi.ts";
import { memoApi } from "./api/memoApi.ts";
import { taskApi } from "./api/taskApi.ts";
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [globalTasks, setGlobalTasks] = useState<TaskItem[]>([]);
  const [memos, setMemos] = useState<MemoItem[]>([]);
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [widgetRes, memoRes, taskRes] = await Promise.all([
          widgetApi.getWidgets(),
          memoApi.getMemos(),
          taskApi.getTasks(),
        ]);
        if (widgetRes) {
          setWidgets(widgetRes);
        }
        console.log(widgetRes, "widgetRes");

        console.log(memoRes, "memoRes");
        const memoItems = memoRes.items ?? (memoRes as any).data.item ?? [];
        setMemos(Array.isArray(memoItems) ? memoItems : []);
        console.log(taskRes, "taskRes");

        if (taskRes) {
          const normalizedTasks = taskRes.map((task: any) => ({
            ...task,
            isDday: Boolean(task.isDday),
          }));
          setGlobalTasks(normalizedTasks);
          console.log(normalizedTasks, "normalizedTasks");

          // console.log(taskRes, "taskRes");
        }
      } catch (err) {
        console.log("데이터 불러오기 실패", err);
      }
    };
    fetchInitialData();
  }, []);

  return (
    <div className="app-container">
      <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-wrapper">
        <Sidebar
          isOpen={isSidebarOpen}
          setWidgets={setWidgets}
          widgets={widgets}
          memos={memos}
          setMemos={setMemos}
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

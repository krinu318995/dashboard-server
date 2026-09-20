import React, { useState, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import Calendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { TaskItem } from "../../types/dashboard.ts";
import { TodoModal } from "../modals/TodoModal.tsx";
import "../../assets/styles/Calendar.css";
import type { EventClickArg, EventContentArg } from "@fullcalendar/core";
import { addDays, format, parseISO } from "date-fns";
interface CalendarPageProps {
  tasks: TaskItem[];
  setTasks: Dispatch<SetStateAction<TaskItem[]>>;
}

export const CalendarPage = ({ tasks, setTasks }: CalendarPageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectTask, setSelectTask] = useState<TaskItem | null>(null);

  const handleDateClick = (arg: { dateStr: string }) => {
    setSelectedDate(arg.dateStr);
    setSelectTask(null);
    setIsModalOpen(true);
  };

  const handleSaveTask = (newTask: TaskItem) => {
    setTasks((prev) => {
      const isExist = prev.some((t) => t.id === newTask.id);
      if (isExist) {
        return prev.map((t) => (t.id === newTask.id ? newTask : t));
      } else {
        return [...prev, newTask];
      }
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!window.confirm("일정을 삭제하시겠습니까?")) {
      return;
    }
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };
  const addTask = (arg: { dateStr: string }) => {
    const taskTitle = prompt(`${arg.dateStr}에 추가할 일정을 입력하세요: `);

    const taskContents = prompt("상세 내용을 입력하세요") || "";

    const taskImage =
      prompt("이미지 경로 또는 데이터 스트링을 입력하세요 (선택):") ||
      undefined;
    if (!taskTitle || !taskTitle.trim()) {
      return;
    }

    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      title: taskTitle,
      content: taskContents,
      // imageUrl: taskImage,
      dueDate: arg.dateStr,
      status: "todo",
      isDday: false,
    };

    setTasks((prev) => [...prev, newTask]);
  }; //addTask

  const calendarEvents = tasks.map((task) => {
    const isDone = task.status === "done";
    const themeColor = isDone ? "#9ca3af" : "#3b82f6";

    const start = task.startDate || task.dueDate;
    const end = task.dueDate;

    if (start && end && start < end) {
      const exclusiveEnd = format(addDays(parseISO(end), 1), "yyyy-MM-dd");
      return {
        id: task.id,
        title: task.title,
        start: start,
        end: exclusiveEnd,
        allDay: true,
        backgroundColor: themeColor,
        borderColor: themeColor,
      };
    }
    return {
      id: task.id,
      title: task.title,
      start: start,
      // end: exclusiveEnd,
      allDay: true,
      backgroundColor: themeColor,
      borderColor: themeColor,
    };
    // if (task.dueDate && task.startDate && task.dueDate >= task.startDate) {
    //   const inclusiveEnd = format(
    //     addDays(parseISO(task.startDate), 1),
    //     "yyyy-MM-dd",
    //   );
    //   return {
    //     id: task.id,
    //     title: task.title,
    //     start: inclusiveEnd,
    //     end: task.dueDate,
    //     allDay: true,
    //     backgroundColor: task.status === "done" ? "#9ca3af" : "#3b82f6",
    //     borderColor: task.status === "done" ? "#9ca3af" : "#3b82f6",
    //   };
    // } else {
    //   return {
    //     id: task.id,
    //     title: task.title,
    //     date: task.dueDate,
    //     allDay: true,
    //     backgroundColor: task.status === "done" ? "#9ca3af" : "#3b82f6",
    //     borderColor: task.status === "done" ? "#9ca3af" : "#3b82f6",
    //   };
    // }
  });

  const handleEventClick = (clickInfo: EventClickArg) => {
    const clickedTaskId = clickInfo.event.id;

    const targetTask = tasks.find((t) => t.id === clickedTaskId);

    if (targetTask) {
      setSelectTask(targetTask);
      setSelectedDate(targetTask.dueDate);
      setIsModalOpen(true);
    }
  };

  const handleRenderedEvent = (evt: EventContentArg) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          padding: "2px 4px",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {evt.event.title}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteTask(evt.event.id);
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "#ffffff",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "12px",
            marginLeft: "4px",
            padding: "0 2px",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    );
  };

  return (
    <div className="full-calendar-page-container">
      {/* <div className="calendar-page-header">
        <h2>전체 일정 관리</h2>
      </div> */}
      <div className="full-calendar-wrapper">
        {" "}
        <Calendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="ko"
          height="100%"
          events={calendarEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventContent={handleRenderedEvent}
          customButtons={{
            pageTitle: {
              text: "전체 일정 관리",
            },
          }}
          headerToolbar={{
            left: "pageTitle",
            center: "title",
            right: "today prev,next",
          }}
        ></Calendar>
        <TodoModal
          isOpen={isModalOpen}
          selectedDate={selectedDate}
          selectedTask={selectTask}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        ></TodoModal>
      </div>
    </div>
  );
}; //CalendarPage

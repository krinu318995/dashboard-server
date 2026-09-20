// import React, { useState, useEffect } from "react";
import type { DashboardSharedProps } from "../../types/dashboard";
import "../../assets/styles/GridBoard.css";
import "../../assets/styles/Todos.css";
import DatePicker from "react-datepicker";
import Calendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { format, setDate } from "date-fns";
import { ko } from "date-fns/locale";
import { useRef, useState } from "react";

interface TodosWidgetProps extends DashboardSharedProps {
  mode: "todos" | "dday" | "mini-calendar";
}
export const TodosWidget = ({
  tasks = [],
  setTasks,
  mode,
}: TodosWidgetProps) => {
  const todayStr = new Date().toISOString().split("T")[0];

  const today = new Date(todayStr);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const currentDateStr = format(selectedDate, "yyyy-MM-dd");

  const calendarRef = useRef<Calendar | null>(null);

  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  const handleCalendarDateChg = (date: Date | null) => {
    if (!date) {
      return;
    }

    setCalendarDate(date);
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.gotoDate(date);
    }
  };

  const currentTodos = tasks.filter((task) => {
    if (task.isDday) {
      return false;
    }
    if (task.startDate) {
      return currentDateStr >= task.startDate && currentDateStr <= task.dueDate;
    }
    return task.dueDate === currentDateStr;
  });

  const calDday = (objDay: string) => {
    const dDay = new Date(objDay);

    const calTime = dDay.getTime() - today.getTime();
    const calDay = Math.ceil(calTime / (1000 * 60 * 60 * 24));

    if (calDay === 0) {
      return "D-DAY";
    } else if (calDay > 0) {
      return `D-${calDay}`;
    }
  };

  const dDayTasks = tasks
    .filter((t) => {
      const taskDate = new Date(t.dueDate);

      return t.isDday === true && taskDate >= today && t.status !== "done";
    })
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )
    .slice(0, 4);

  const handleToggle = (taskId: string) => {
    if (!setTasks) {
      return;
    }
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) {
          return task;
        }
        const completed = task.completedDates || [];
        const isAlreadyDone = completed.includes(currentDateStr);

        const newCompletedDates = isAlreadyDone
          ? completed.filter((d) => d !== currentDateStr)
          : [...completed, currentDateStr];
        return {
          ...task,
          completedDates: newCompletedDates,
        };
      }),
    );
  }; //end handleToggle

  const handleDeleteTask = (taskId: string) => {
    if (!setTasks) {
      return;
    }

    if (!window.confirm("일정을 삭제하시겠습니까?")) {
      return;
    }
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  return (
    <div className="modern-todo-widget-container">
      {/**헤더 */}

      {mode === "todos" && (
        <div className="widget-content-wrap">
          <div className="widget-top-bar">
            <div className="calendar-icon-badge">
              <span className="badge-day">{format(selectedDate, "d")}</span>
            </div>
            <h4 className="widget-main-title">
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => date && setSelectedDate(date)}
                dateFormat="M.dd eee"
                locale={ko}
                portalId="root-portal"
                popperPlacement="bottom-start"
                customInput={
                  <button type="button" className="date-picker-trigger-btn">
                    {format(selectedDate, "M.dd eee", { locale: ko })}
                  </button>
                }
              />
            </h4>
          </div>

          <div className="todo-item-scroll-list">
            {currentTodos?.length !== 0 ? (
              <ul className="modern-todo-ul">
                {currentTodos.map((t) => {
                  const isDone =
                    t.completedDates?.includes(currentDateStr) ?? false;
                  return (
                    <li
                      key={t.id}
                      className={`modern-todo-li ${isDone ? "is-done" : ""}`}
                    >
                      <div className="checkbox-custom-label">
                        <input
                          type="checkbox"
                          id={`checkbox-${t.id}`}
                          checked={isDone}
                          onChange={() => handleToggle(t.id)}
                        />{" "}
                        <label
                          htmlFor={`checkbox-${t.id}`}
                          className="custom-checkbox-box"
                        ></label>
                      </div>
                      <div className="todo-text-group">
                        <label
                          htmlFor={`checkbox-${t.id}`}
                          className="custom-title-text"
                        >
                          {t.title}
                        </label>
                        {t.dueDate && (
                          <span className="todo-sub-date">
                            {format(new Date(t.dueDate), "M.dd")}까지
                          </span>
                        )}
                      </div>

                      {/**삭제 버튼 */}
                      <button
                        className="widget-delete-todos-btn"
                        onClick={() => handleDeleteTask(t.id)}
                      >
                        X
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="empty-state-text">등록된 일정이 없습니다.</p>
            )}
          </div>
        </div>
      )}
      {mode === "dday" &&
        (dDayTasks.length !== 0 ? (
          <div className="widget-content-wrap">
            <div className="dday-display-list">
              {dDayTasks.map((t) => (
                <div key={t.id} className="dday-single-item">
                  <div className="dday-highlight-badge">
                    {calDday(t.dueDate)}
                  </div>
                  <div className="dday-sub-info">
                    <span className="dday-target-date">
                      {t.dueDate.replace(/-/g, ".")}
                    </span>
                    <span className="dday-title-text">
                      {t.title || "제목 없음"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="empty-state-text">등록된 일정이 없습니다.</p>
        ))}
      {mode === "mini-calendar" && (
        <div className="widget-content-wrap">
          {" "}
          <div className="widget-top-bar">
            <div className="calendar-icon-badge">
              <span className="badge-day">{format(calendarDate, "d")}</span>
            </div>
            <h4 className="widget-main-title">
              <DatePicker
                selected={calendarDate}
                onChange={handleCalendarDateChg}
                dateFormat="yyyy년 M월"
                locale={ko}
                portalId="root-portal"
                popperPlacement="bottom-start"
                customInput={
                  <button type="button" className="date-picker-trigger-btn">
                    {format(calendarDate, "yyyy년 M월", { locale: ko })}
                  </button>
                }
              />
            </h4>
          </div>
          <div
            className="calendar-container-inner"
            style={{ flex: 1, overflow: "hidden" }}
          >
            <Calendar
              ref={calendarRef}
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              initialDate={calendarDate}
              dayCellContent={(arg) => arg.date.getDate()}
              locale="ko"
              headerToolbar={false}
              // height="auto"
              height="100%"
              aspectRatio={1.1} // ⭐️ 가로/세로 비율을 컴팩트하게 압축
              expandRows={true} // ⭐️ 남는 공간을 균등하게 채움s
              events={tasks.map((t) => {
                // const isRange = !!t.startDate && t.startDate !== t.dueDate;
                const endDate = new Date(t.dueDate);
                endDate.setDate(endDate.getDate() + 1);
                return {
                  id: t.id,
                  title: t.title,
                  start: t.startDate || t.dueDate,
                  allDay: true,
                  end: endDate,
                  status: t.status,
                };
              })}
            ></Calendar>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from "react";
import type { TaskItem, CreateTaskDTO } from "../../types/dashboard";
import type { FC, SyntheticEvent } from "react";
import DatePicker from "react-datepicker";
import { format, parseISO } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import "../../assets/styles/Modals.css";
import { ko } from "date-fns/locale";
import { taskApi } from "../../api/taskApi.ts";
export interface TodoModalProps {
  isOpen: boolean;
  selectedDate: string;
  onClose: () => void;
  onSave: (newTask: TaskItem) => void;
  selectedTask?: TaskItem | null;
  onDelete?: (id: string) => void;
}
export const TodoModal: FC<TodoModalProps> = ({
  isOpen,
  selectedDate,
  onClose,
  onSave,
  onDelete,
  selectedTask,
}) => {
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isDday, setIsDday] = useState(false);
  const [status, setStatus] = useState<TaskItem["status"]>("in-progress");
  const [dueDateObj, setDueDateObj] = useState<Date>(
    selectedDate ? parseISO(selectedDate) : new Date(),
  );
  const [startDateObj, setStartDateObj] = useState<Date | null>(null);
  // const todayStr = format(new Date(), "yyyy-MM-dd");
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (selectedTask) {
      const isDdayVal = selectedTask.isDday ?? selectedTask.isDday;
      setTitle(selectedTask.title);
      setContents(selectedTask.content);
      setImageUrl(selectedTask.imageUrl || "");
      // setIsDday(selectedTask.isDday || false);
      setIsDday(Number(isDdayVal) === 1);
      const parsedDue = selectedTask.dueDate
        ? parseISO(selectedTask.dueDate.split("T")[0])
        : new Date();
      setDueDateObj(parsedDue);
      setStartDateObj(
        selectedTask.startDate
          ? parseISO(selectedTask.startDate.split("T")[0])
          : parsedDue,
      );
    } else {
      setTitle("");
      setContents("");
      setImageUrl("");
      const initialDate = selectedDate ? parseISO(selectedDate) : new Date();
      setStartDateObj(initialDate);
      setDueDateObj(initialDate);
      setIsDday(false);
    }
  }, [isOpen, selectedTask]);

  // const handleDateChange = (date: Date | null) => {
  //   if (!date) {
  //     return;
  //   }
  //   setDueDateObj(date);

  //   // const formattedDate = format(date, "yyyy-MM-dd");
  //   // setIsDday(formattedDate !== todayStr);
  // };
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("일정을 입력해 주세요.");
      return;
    }
    // 날짜 유효성 검사 시작일 < 마감일
    if (!isDday && startDateObj && startDateObj > dueDateObj) {
      alert(
        "시작일은 마감일(예정일)보다 앞서야 합니다." +
          startDateObj +
          " > " +
          dueDateObj,
      );
      return;
    }
    // const targetId = selectedTask
    //   ? selectedTask.id
    //   : `task_${crypto.randomUUID()}`;

    const newTask: CreateTaskDTO = {
      // id: targetId,
      title: title.trim(),
      content: contents, // 빈 값이어도 문자열로 허용
      imageUrl: imageUrl.trim() || undefined,
      dueDate: format(dueDateObj, "yyyy-MM-dd"),
      startDate:
        !isDday && startDateObj
          ? format(startDateObj, "yyyy-MM-dd")
          : undefined,
      isDday: isDday,
      status: status,
    };

    if (selectedTask) {
      await taskApi.updateTask(selectedTask.id, newTask);

      onSave({
        ...newTask,
        id: selectedTask.id,
        status: selectedTask.status, // 기존 상태 유지
        completedDates: selectedTask.completedDates,
      });
    } else {
      // await taskApi.createTask(newTask);
      const res = await taskApi.createTask(newTask);

      // 백엔드가 res.data 안에 { id: '...', ... }를 반환해 주는 경우
      const createdId = res.data?.data?.id;
      onSave({
        ...newTask,
        id: createdId,
        completedDates: [],
      });
    }

    alert(selectedTask ? "수정되었습니다." : "저장되었습니다.");
    setTitle("");
    setContents("");
    setImageUrl("");
    onClose();
  };

  const handleDelete = async () => {
    if (!selectedTask || !onDelete) {
      return;
    }
    if (window.confirm("일정을 삭제하시겠습니까?")) {
      // onDelete(selectedTask.id);
      await taskApi.deleteTask(selectedTask.id);
      alert("삭제되었습니다.");
      onClose();
    }
  };
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {selectedTask ? (
          <h3>일정 확인({selectedDate})</h3>
        ) : (
          <h3>일정 추가 ({selectedDate})</h3>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          {/**일정 제목 */}
          <div className="modal-formGroup">
            {/* <label className="modal-label">일정</label> */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="할 일을 입력하세요."
              className="modal-input"
              required
            />
          </div>
          {/** 플랜 유형 */}
          <div className="modal-formGroup">
            <label htmlFor="" className="modal-radio-label">
              <input
                type="radio"
                name="taskType"
                checked={!isDday}
                onChange={() => setIsDday(false)}
              />
              <span>할 일</span>
            </label>
            <label htmlFor="" className="modal-radio-label">
              <input
                type="radio"
                name="taskType"
                checked={isDday}
                onChange={() => setIsDday(true)}
              />
              <span>D-day</span>
            </label>
          </div>
          {/**날짜 선택 */}

          <div className="modal-formGroup">
            <label htmlFor="">{isDday === true ? "D-day" : "예정일"}</label>{" "}
            {!isDday && (
              <DatePicker
                selected={startDateObj}
                onChange={(date: Date | null) => setStartDateObj(date)}
                dateFormat="yyyy-MM-dd"
                locale={ko}
                className="custom-datepicker-input"
              ></DatePicker>
            )}
            <DatePicker
              selected={dueDateObj}
              onChange={(date: Date | null) => setDueDateObj(date)}
              dateFormat="yyyy-MM-dd"
              locale={ko}
              className="custom-datepicker-input"
            ></DatePicker>
          </div>
          {/**상세 일정 */}
          <div className="modal-formGroup">
            {/* <label className="modal-label">상세 내용</label> */}
            <textarea
              className="modal-textarea"
              value={contents}
              onChange={(e) => setContents(e.target.value)}
              placeholder="상세 내용을 입력하세요."
            ></textarea>
          </div>
          {/**이미지 */}
          {/* <div className="modal-formGroup">
            <label className="modal-label">이미지</label>
            <input
              type="file"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div> */}
          <div className="modal-buttonGroup">
            <button className="modal-cancelBtn" type="button" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="modal-saveBtn">
              저장
            </button>
            {selectedTask ? (
              <button
                type="button"
                onClick={handleDelete}
                className="modal-deleteBtn"
              >
                삭제
              </button>
            ) : (
              <div />
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

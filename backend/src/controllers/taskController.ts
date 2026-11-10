import { RequestHandler, Request, Response } from "express";
import pool from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { format } from "node:path";

// task => id, title, content, is_dday, start_date, due_date, status, image_url, created_at, updated_at
// task_completions => id, task_id, completed_date, created_at
export const getTasks: RequestHandler = async (req, res): Promise<void> => {
  const { start, end } = req.query;
  try {
    let query = `SELECT id, title, is_dday as isDday, DATE_FORMAT(start_date, '%Y-%m-%d') AS startDate,
      DATE_FORMAT(due_date, '%Y-%m-%d') AS dueDate, 
      status, created_at, updated_at FROM tasks`;

    const params: Record<string, string> = {};
    if (start && end) {
      console.log("startDate:", start, "endDate:", end);

      query += ` WHERE due_date >= :calMinDate AND COALESCE(start_date, due_date) <= :calMaxDate`;

      params.calMinDate = String(start); //하한선
      params.calMaxDate = String(end); //상한선
    }

    query += ` ORDER BY start_date ASC`;

    const [tasks] = await pool.query<RowDataPacket[]>(query, params);

    console.log("Fetched tasks:", tasks);
    // const task = tasks[0];
    // const taskId = tasks.map((task) => task.id);
    // const [completions] = await pool.query<RowDataPacket[]>(
    //   `
    //   SELECT task_id, completed_date FROM task_completions WHERE task_id IN (${taskId.join(",")})
    // `,
    //   [],
    // );

    // const completedDates = completions.map((completion) => {
    //   const d = new Date(completion.completed_date);
    //   return d.toISOString().split("T")[0];
    // });
    res.status(200).json({
      success: true,
      data: {
        items: tasks,
        // completions: completedDates,
      },
    });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({
      success: false,
      error: "일정 목록을 가져오는 중 오류가 발생했습니다.",
    });
  }
};

export const createTask: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id, title, content, isDday, startDate, dueDate, status } = req.body;
    const isDdayVal = isDday ? 1 : 0;

    const query = `INSERT INTO tasks (title, content, is_dday,
   start_date, due_date, status, image_url) VALUES 
   (:title, :content, :isDday, :startDate, :dueDate, :status, :imageUrl)`;

    await pool.query<ResultSetHeader>(query, {
      title,
      content,
      isDday: isDdayVal,
      startDate,
      dueDate,
      status,
      imageUrl: null, // Assuming imageUrl is optional and can be null
    });

    res.status(201).json({
      success: true,
      message: "일정이 성공적으로 추가되었습니다.",
      data: {
        title: title,
        content: content,
        isDday: isDday,
        startDate: startDate,
        dueDate: dueDate,
        status: status,
        imageUrl: null,
      },
    });
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({
      success: false,
      error: "일정 추가 중 오류가 발생했습니다.",
    });
  }
};

export const updateTask: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { title, content, isDday, startDate, dueDate, status } = req.body;
    const isDdayVal = isDday ? 1 : 0;
    const { id } = req.params;

    const query = `UPDATE tasks SET title = :title, content = :content, is_dday = :isDday, start_date = :startDate, due_date = :dueDate, status = :status WHERE id = :id`;
    await pool.query<ResultSetHeader>(query, {
      title,
      content,
      isDday: isDdayVal,
      startDate,
      dueDate,
      status,
      id,
    });

    res.status(200).json({
      success: true,
      message: "일정이 성공적으로 수정되었습니다.",
      data: {
        title: title,
        content: content,
        isDday: isDday,
        startDate: startDate,
        dueDate: dueDate,
        status: status,
      },
    });
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({
      success: false,
      error: "일정 수정 중 오류가 발생했습니다.",
    });
  }
};

export const deleteTask: RequestHandler = async (req, res): Promise<void> => {
  const { id } = req.params;
  try {
    const query = `DELETE FROM tasks WHERE id = :id`;
    const [result] = await pool.query<ResultSetHeader>(query, { id });

    if (result.affectedRows === 0) {
      res.status(404).json({
        scuuess: false,
        error: "일정이 존재하지 않습니다.",
      });
    }

    res.status(200).json({
      success: true,
      message: "일정이 성공적으로 삭제되었습니다.",
    });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({
      success: false,
      error: "일정 삭제 중 오류가 발생했습니다.",
    });
  }
};

export const getTaskById: RequestHandler = async (req, res): Promise<void> => {
  const taskId = String(req.params.id);
  try {
    const query = `SELECT id, title, is_dday, start_date as startDate, 
    due_date as dueDate, status, created_at, updated_at FROM tasks WHERE id = :taskId`;
    const [tasks] = await pool.query<RowDataPacket[]>(query, { taskId });
    res.status(200).json({
      success: true,
      data: tasks[0],
    });
  } catch (err) {
    console.error("Error fetching task:", err);
    res.status(500).json({
      success: false,
      error: "일정 조회 중 오류가 발생했습니다.",
    });
  }
};

const checkTaskCompletionStatus = async (taskId: string) => {
  const query = `SELECT id, task_id, DATE_FORMAT(completed_date, '%Y-%m-%d') AS completedDate  FROM task_completions WHERE task_id = :taskId`;
  const [completions] = await pool.query<RowDataPacket[]>(query, { taskId });
  console.log("Fetched completions for taskId:", taskId, completions);
  return completions;
};

export const toggleTaskCompletion: RequestHandler = async (
  req,
  res,
): Promise<void> => {
  const taskId = String(req.params.id);
  const targetDate = req.body?.date;
  // const { date } = req.body;

  //1. task 테이블 상태 확인
  //2-1. task 테이블 상태 업데이트
  //2-2. task의 due_date와 현재 날짜를 비교하여 status를 'done' 으로 변경
  //2-3. due_date가 현재 날짜보다 뒤라면 status 변경 없이 task_completions 테이블에 완료 상태 추가 또는 삭제
  //3. 완료 상태 변경 결과 반환

  if (!targetDate) {
    res.status(400).json({
      success: false,
      error: "선택한 날짜 정보가 전달되지 않았습니다.",
    });
    return;
  }
  try {
    const completions = await checkTaskCompletionStatus(taskId);
    console.log(completions + "completions");
    const matchedRecord = completions.find(
      (c) => c.completedDate === targetDate,
    );
    const insertQuery = `INSERT INTO task_completions (task_id , completed_date)  VALUES (:taskId, :targetDate)`;
    const deleteQuery = `DELETE FROM task_completions WHERE id = :id`;
    if (matchedRecord) {
      await pool.query<ResultSetHeader>(deleteQuery, { id: matchedRecord.id });

      res.status(200).json({
        success: true,
        message: "일정 완료 상태가 성공적으로 취소되었습니다.",
      });
    } else {
      await pool.query<ResultSetHeader>(insertQuery, { taskId, targetDate });
      res.status(201).json({
        success: true,
        message: "일정 완료 상태가 성공적으로 등록되었습니다.",
      });
    }
  } catch (err) {
    console.error("Error toggling task completion:", err);
    res.status(500).json({
      success: false,
      error: "일정 완료 상태 변경 중 오류가 발생했습니다.",
    });
  }
};

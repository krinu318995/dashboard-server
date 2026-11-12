import { RequestHandler, Request, Response } from "express";
import pool from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { WidgetPayload, WidgetRow } from "../types/widget";
import { randomUUID } from "crypto";
import { json } from "stream/consumers";

export const getWidgets: RequestHandler = async (req, res): Promise<void> => {
  try {
    const [rows] = await pool.query<(WidgetRow & RowDataPacket)[]>(
      "SELECT id, type, x, y, w, h, view_mode AS viewMode, data, mode FROM widgets",
    );

    const parseData = rows.map((wRow) => ({
      ...wRow,
      data: typeof wRow.data === "string" ? JSON.parse(wRow.data) : wRow.data,
    }));

    res.status(200).json({
      success: true,
      message: "위젯 데이터를 불러오는데 성공했습니다.",
      data: parseData,
    });
  } catch (err) {
    console.error(" 위젯을 불러오는 중 문제가 발생하였습니다.", err);
    res.status(500).json({
      success: false,
      message: "위젯 데이터를 불러오지 못했습니다.",
    });
  }
};
export const createWidget: RequestHandler = async (req, res): Promise<void> => {
  const { id, type, x, y, w, h, viewMode, data, mode } =
    req.body as WidgetPayload;

  //id, type, x, y, w, h, view_mode, data, updated_at
  try {
    const widgetId = id || crypto.randomUUID();

    const query = `INSERT INTO widgets (id, type, x, y, w, h, view_mode, data, mode)
     values (:id, :type, :x, :y, :w, :h, :viewMode, :data, :mode)
     ON DUPLICATE KEY UPDATE
     x = VALUES(x), 
     y = VALUES(y),
     w = VALUES(w), 
     h = VALUES(h),
     view_mode = VALUES(view_mode),
     mode = VALUES(mode),
     data = VALUES(data)`;
    const resolvedMode = type === "todo" ? mode || "todos" : null;
    await pool.query<ResultSetHeader>(query, {
      id: widgetId,
      type: type || "default",
      x: x ?? 0,
      y: y ?? 0,
      w: w ?? 1,
      h: h ?? 1,
      mode: resolvedMode,
      viewMode: type === "memo" ? viewMode || "normal" : null,
      data: data
        ? typeof data === "object"
          ? JSON.stringify(data)
          : data
        : null,
    });

    res.status(201).json({
      success: true,
      message: "위젯 데이터가 정상적으로 등록되었습니다.",
      data: {
        id: widgetId,
        type,
        x: x ?? 0,
        y: y ?? 0,
        w: w ?? 1,
        h: h ?? 1,
        viewMode: type === "memo" ? viewMode || "normal" : null,
        mode: resolvedMode,
        data,
      },
    });
  } catch (err) {
    console.error("위젯 데이터 입력 중 오류가 발생하였습니다. ", err);
    res.status(500).json({
      success: false,
      message: "위젯 생성 중 오류가 발생하였습니다.",
    });
  }
};

export const deleteWidget: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM widgets WHERE id = :id`;

    const [result] = await pool.query<ResultSetHeader>(query, { id });

    if (result.affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: "해당 위젯을 찾을 수 없습니다.",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "위젯이 정상적으로 삭제되었습니다.",
        data: { id },
      });
    }
  } catch (err) {
    console.error("위젯 삭제 중 오류가 발생하였습니다.", err);
    res.status(500).json({
      success: false,
      message: "위젯 데이터 삭제 중 오류가 발생하였습니다.",
    });
  }
};

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();

import pool from "./config/db";
import memoRouter from "./routes/memoRoutes";
import taskRouter from "./routes/taskRoutes";
import widgetRouter from "./routes/widgetRoutes";

// const pool = require("./db");

// require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
// app.use(express.json()); // 기본 한도(100kb)로 먼저 등록됨
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));
//http method get
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "백엔드 서버 구동 확인" });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS nowTime");
    const dbRows = rows as Array<{ nowTime: string }>;
    res.json({
      status: "ok",
      message: "MySQL 연결 성공",
      serverTime: dbRows[0]?.nowTime,
    });
  } catch (Err) {
    console.error(Err, " db error");
    res.status(500).json({
      status: "error",
      error: Err instanceof Error ? Err.message : String(Err),
    });
  }
});

app.use("/api/memos", memoRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/widgets", widgetRouter);

// app.get("/api/memos", async (req, res) => {
//   try {
//     const [rows] = await pool.query(`
//       SELECT
//         id,
//         title,
//         memo_text AS memoText,
//         image_url AS imageUrl,
//         created_at AS createdAt,
//         updated_at AS updatedAt
//       FROM memos
//       ORDER BY created_at DESC
//     `);
//     res.json(rows);
//   } catch (error) {
//     console.error(error, ` 메모 조회 실패`);
//     res.status(500).json({
//       status: "error",
//       message: "메모 목록 조회 실패",
//       error: error instanceof Error ? error.message : String(error),
//     });
//   }
// });

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});

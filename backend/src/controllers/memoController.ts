import { RequestHandler, Request, Response } from "express";
import pool from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

//promise가 있기 때문에 getMemos의 타입을 RequestHandler로 지정
export const getMemos: RequestHandler = async (req, res): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT id, title, memo_text as memoText, 
            image_url as imageUrl, 
            created_at as createdAt,
            updated_at as updatedAt FROM memos
            ORDER BY created_at DESC`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "메모 목록 조회 실패" });
  }
};

export const updateMemos: RequestHandler = async (req, res): Promise<void> => {
  const { id } = req.params;
  const { title, memoText, imageUrl } = req.body;
  try {
    // const query = `UPDATE memos SET
    //   title = COALESCE(?, title),
    //   memo_text = COALESCE(?, memo_text),
    //   image_url = COALESCE(?, image_url),
    //   updated_at = CURRENT_TIMESTAMP
    //   where id = ?`;

    const isImageProvided = imageUrl !== undefined;

    const query = `UPDATE memos SET 
      title = COALESCE(:title, title),
      memo_text = COALESCE(:memoText, memo_text),
      image_url = CASE WHEN :isImageProvided = 1 THEN :imageUrl ELSE image_url END,
      updated_at = CURRENT_TIMESTAMP
      where id = :id`;
    const [result] = await pool.query<ResultSetHeader>(query, {
      title: title !== undefined ? title : null,
      memoText: memoText !== undefined ? memoText : null,
      imageUrl: imageUrl !== undefined ? imageUrl : null,
      id,
      isImageProvided: isImageProvided ? 1 : 0,
    });

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "해당 메모를 찾을 수 없습니다." });
      return;
    }

    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "메모 업데이트 실패" });
  }
};
//    const newMemoId = `memo_${crypto.randomUUID()}`;

export const createMemo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const newMemoId = `memo_${crypto.randomUUID()}`;
    const { title, memoText, imageUrl } = req.body;
    //컬럼 개수와 플레이스 홀더 개수가 일치하는지 주의해야 함
    const query = `INSERT INTO memos
     (id, title, memo_text, image_url) 
     values
     (:id, :title, :memoText, :imageUrl)`;

    await pool.query<ResultSetHeader>(query, {
      id: newMemoId,
      title: title || "",
      memoText: memoText || "",
      imageUrl: imageUrl || null,
    });

    res.status(201).json({
      success: true,
      data: {
        id: newMemoId,
        title: title || "",
        memoText: memoText || "",
        imageUrl: imageUrl || null,
      },
    });
  } catch (err) {
    console.error(err, " 메모 입력 오류");
    res.status(500).json({ err: "메모 생성 실패" });
  }
};

import { Router } from "express";
import {
  createMemo,
  getMemos,
  updateMemos,
  deleteMemo,
  getMemoById,
} from "../controllers/memoController";

const memoRouter = Router();
memoRouter.get("/", getMemos);
memoRouter.post("/", createMemo);
memoRouter.put("/:id", updateMemos);
memoRouter.delete("/:id", deleteMemo);
memoRouter.get("/:id", getMemoById);

export default memoRouter;

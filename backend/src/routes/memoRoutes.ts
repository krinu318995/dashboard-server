import { Router } from "express";
import {
  createMemo,
  getMemos,
  updateMemos,
} from "../controllers/memoController";

const memoRouter = Router();
memoRouter.get("/", getMemos);
memoRouter.post("/", createMemo);
memoRouter.put("/:id", updateMemos);
export default memoRouter;

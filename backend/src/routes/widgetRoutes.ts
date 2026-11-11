import { Router } from "express";
import {
  getWidgets,
  createWidget,
  deleteWidget,
} from "../controllers/widgetController";

const widgetRouter = Router();
widgetRouter.get("/", getWidgets);
widgetRouter.post("/", createWidget);
widgetRouter.delete("/:id", deleteWidget);

export default widgetRouter;
//반드시 server.ts 에 라우트 등록

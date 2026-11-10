import { Router } from "express";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
  toggleTaskCompletion,
} from "../controllers/taskController";

const taskRouter = Router();

taskRouter.get("/", getTasks);
taskRouter.post("/", createTask);
taskRouter.put("/:id", updateTask);
taskRouter.delete("/:id", deleteTask);
taskRouter.get("/:id", getTaskById);

taskRouter.post("/:id/completions", toggleTaskCompletion);

export default taskRouter;

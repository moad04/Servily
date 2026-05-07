const express = require("express");
const Router = express.Router();
const TaskController = require("../controllers/taskController");
const uploadTask = require("../config/uploadTask");

Router.post("/create", TaskController.createTask);
Router.get("/", TaskController.getAllTasks);
Router.get("/my", TaskController.getMyTasks);
Router.post("/delete/:id", TaskController.deleteTask);
Router.post(
  "/edit/:id",
  uploadTask.single("taskImage"),
  TaskController.editTask,
);
Router.get("/view-task/:id", TaskController.getSingleTask);

module.exports = Router;

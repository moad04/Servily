const Task = require("../database/models/Task");
const algeria = require("../config/algeria.json");
const wilayas = [...new Set(algeria.map((item) => item.wilaya_name_ascii))];
const Application = require("../database/models/Application");

exports.createTask = async (req, res) => {
  try {
    const user = req.session.user || req.user;
    const userId = user._id;
    if (!user.isIdVerified) {
      req.flash("error", "You cannot post tasks, Please verify your ID!");
      return res.redirect("/tasks/my");
    }
    const newTask = await Task.create({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      wilaya: req.body.wilaya,
      baladiya: req.body.baladiya,
      neededWorkers: req.body.neededWorkers || 1,
      client: userId,
      wage: req.body.wage,
    });
    req.flash("success", "Task Created succefully");
    return res.redirect("/tasks/my");
  } catch (error) {
    console.log(error);
    req.flash("error", "Action failed!");
    return res.redirect("/tasks/my");
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const allTasks = await Task.find().populate("client");
    const user = req.session.user || req.user;
    return res.render("tasks", {
      tasks: allTasks,
      user: user,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const user = req.session.user || req.user;
    const userId = user._id;
    const tasks = await Task.find({ client: userId });
    return res.render("my-tasks", {
      tasks,
      user,
      wilayas,
      algeria,
      messages: req.flash(),
    });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findOneAndDelete(taskId);
    if (!task) {
      req.flash("error", "Task doesnt exist!");
      return res.redirect("/tasks/my");
    }
    req.flash("success", "Task deleted successfully");
    res.redirect("/tasks/my");
  } catch (error) {
    console.log(error);
    req.flash("error", "An error occured!");
    return res.redirect("/tasks/my");
  }
};
exports.editTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { name, description, category, wilaya, baladiya } = req.body || {};
    const existingTask = await Task.findById(taskId);
    let taskPics = existingTask.picture;
    if (req.file) {
      taskPics = `/uploads/tasks/${req.file.filename}`;
    }
    console.log("Existing picture:", existingTask.picture);
    console.log("New file:", req.file);
    if (req.file)
      console.log("New picture path:", `/uploads/tasks/${req.file.filename}`);
    console.log("Final taskPics:", taskPics);
    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        name,
        description,
        category,
        wilaya,
        baladiya,
        picture: taskPics,
      },
      { new: true },
    );

    if (!task) {
      req.flash("error", "Task doesn't exist!");
      return res.redirect("/tasks/my");
    }

    req.flash("success", "Task updated");
    console.log("BODY:", req.body);
    return res.redirect("/tasks/my");
  } catch (error) {
    console.log(error);
    req.flash("error", "An error occured!");
    return res.redirect("/tasks/my");
  }
};

exports.getSingleTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const user = req.session.user || req.user;
    const task = await Task.findById(taskId).populate("client");
    let userApplication = null;
    if (user && user.role === "worker") {
      userApplication = await Application.findOne({
        task: taskId,
        worker: user._id,
      });
    }
    if (!task) {
      req.flash("error", "Task Doesn't exist!");
      return res.redirect("");
    }
    return res.render("single-task", {
      user,
      task,
      userApplication,
      messages: req.flash(),
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "An error occured");
    return res.redirect("/");
  }
};

exports.getReceipt = async (req, res) => {
  try {
    const taskId = req.params.id;
    console.log("Task ID received:", req.params.id);
    const user = req.session.user || req.user;
    const task = await Task.findById(taskId).populate(
      "client",
      "firstName lastName email phone",
    );
    console.log("Task found:", task ? "YES" : "NO");
    console.log("Task name:", task ? task.name : "N/A");
    console.log("Task status:", task ? task.status : "N/A");
    if (!task) {
      req.flash("error", "Task not found");
      return res.redirect("/application/client-applications");
    }
    const acceptedApplication = await Application.findOne({
      task: taskId,
      status: "accepted",
    }).populate("worker", "firstName lastName email phone");

    if (!acceptedApplication) {
      req.flash("error", "No accepted application found");
      return res.redirect("/application/client-applications");
    }
    if (
      user._id.toString() !== task.client._id.toString() &&
      user._id.toString() !== acceptedApplication.worker._id.toString()
    ) {
      req.flash("error", "You don't have access to this receipt");
      return res.redirect("/tasks");
    }
    res.render("receipt", {
      task,
      application: acceptedApplication,
      user,
      messages: req.flash(),
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "An error occured");
    return res.redirect("/application/client-applications");
  }
};

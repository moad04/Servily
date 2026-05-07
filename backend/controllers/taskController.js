const Task = require("../database/models/Task");
const algeria = require("../config/algeria.json");
const wilayas = [...new Set(algeria.map((item) => item.wilaya_name_ascii))];

exports.createTask = async (req, res) => {
  try {
    const user = req.session.user || req.user;
    const userId = user._id;
    const newTask = await Task.create({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      wilaya: req.body.wilaya,
      baladiya: req.body.baladiya,
      neededWorkers: req.body.neededWorkers || 1,
      client: userId,
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
    if (!task) {
      req.flash("error", "Task Doesn't exist!");
      return res.redirect("");
    }
    return res.render("single-task", { user, task, messages: req.flash() });
  } catch (error) {
    console.log(error);
    req.flash("error", "An error occured");
    return res.redirect(" ");
  }
};

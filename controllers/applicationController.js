const Application = require("../database/models/Application");
const Task = require("../database/models/Task");
const Notification = require("../database/models/Notification");

exports.createApplication = async (req, res) => {
  try {
    const worker = req.session.user || req.user;
    const { taskId, proposedPrice, message } = req.body;

    if (!worker) {
      req.flash("error", "You need to log in to apply for this job!");
      return res.redirect("/login");
    }

    const task = await Task.findById(taskId);
    if (!task) {
      req.flash("error", "Task not found");
      return res.redirect(`/tasks/view-task/${taskId}`);
    }

    if (task.client.toString() === worker._id.toString()) {
      req.flash("error", "You cannot apply to your own task");
      return res.redirect(`/tasks/view-task/${taskId}`);
    }

    const existingApplication = await Application.findOne({
      task: taskId,
      worker: worker._id,
    });

    if (existingApplication) {
      req.flash("error", "You already applied for this task!");
      return res.redirect(`/tasks/view-task/${taskId}`);
    }

    await Application.create({
      task: taskId,
      worker: worker._id,
      client: task.client,
      proposedPrice: proposedPrice,
      message: message,
      status: "pending",
    });
    await Notification.create({
      userId: task.client,
      type: "new_applications",
      read: false,
    });

    req.flash("success", "Application submitted successfully!");
    return res.redirect(`/tasks/view-task/${taskId}`);
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong!");
    return res.redirect(`/tasks/view-task/${req.body.taskId}`);
  }
};
exports.getClientApplication = async (req, res) => {
  try {
    const client = req.session.user || req.user;

    if (!client) {
      req.flash("error", "You need to be logged in!");
      return res.redirect("/login");
    }

    const allApplications = await Application.find({
      client: client._id,
    })
      .populate("task", "name description location status")
      .populate("worker", "firstName lastName email skills rating")
      .sort({ createdAt: -1 });

    await Notification.updateMany(
      { userId: client._id, type: "new_applications", read: false },
      { read: true },
    );

    return res.render("client-applications", {
      applications: allApplications,
      user: client,
      messages: req.flash(),
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong");
    return res.redirect("/");
  }
};

exports.rejectApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await Application.findById(applicationId).populate(
      "worker",
      "firstName lastName",
    );
    if (!application) {
      req.flash("error", "Application doesn't exist!");
      return res.redirect("/application/client-applications");
    }
    if (application.status !== "pending") {
      req.flash("error", "You can only reject pending applications!");
      return res.redirect("/application/client-applications");
    }
    application.status = "rejected";
    await application.save();

    await Notification.create({
      userId: application.worker._id,
      type: "application_rejected",
      message: `Your application for "${application.task.name}" was rejected`,
      read: false,
    });
    const workerName = `${application.worker.firstName} ${application.worker.lastName}`;
    req.flash("success", `${workerName}'s application was rejected`);
    return res.redirect("/application/client-applications");
    return res.redirect("/application/client-applications");
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong!");
    return res.redirect("/application/client-applications");
  }
};
exports.getWorkerApplications = async (req, res) => {
  try {
    const worker = req.session.user || req.user;

    if (!worker) {
      req.flash("error", "You need to be logged in!");
      return res.redirect("/login");
    }
    const allApplications = await Application.find({
      worker: worker._id,
    })
      .populate("task", "name description location status")
      .populate("client", "firstName lastName email")
      .sort({ createdAt: -1 });
    await Notification.updateMany(
      { userId: worker._id, type: "application_rejected", read: false },
      { read: true },
    );
    return res.render("worker-applications", {
      applications: allApplications,
      user: worker,
      messages: req.flash(),
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong!");
    return res.redirect("/");
  }
};

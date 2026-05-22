const express = require("express");
const Router = express.Router();
const applicationController = require("../controllers/applicationController");

Router.post("/send-application", applicationController.createApplication);
Router.get("/client-applications", applicationController.getClientApplication);
Router.post(
  "/reject-application/:applicationId",
  applicationController.rejectApplication,
);
Router.get("/worker-applications", applicationController.getWorkerApplications);
Router.post("/accept/:appId", applicationController.acceptApplication);

module.exports = Router;

const express = require("express");
const Router = express.Router();
const ratingController = require("../controllers/ratingController");

Router.post("/add-rating", ratingController.ratingSystem);

module.exports = Router;

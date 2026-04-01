const mongoose = require("mongoose");
const { userCollection } = require("./User");

const clientSchema = new mongoose.Schema({
  rating: { type: String },
});

const Client = userCollection.discriminator("client", clientSchema);
module.exports = Client;

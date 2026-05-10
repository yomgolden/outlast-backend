const mongoose = require("mongoose");

const toolSchema = new mongoose.Schema({
  name: String,

  cost: Number,

  type: String,

  effect: String
});

module.exports = mongoose.model("Tool", toolSchema);

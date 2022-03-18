const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema({
  enter: Date,
  exit: Date,
});

module.exports = mongoose.model("Shift", shiftSchema);

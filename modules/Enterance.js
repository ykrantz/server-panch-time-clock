const mongoose = require("mongoose");

const enteranceSchema = new mongoose.Schema({
  //   id: {
  //     type: mongoose.SchemaTypes.ObjectId,
  //     ref: "Employee",
  //   },
  id: String,
  enter: Date,
});

module.exports = mongoose.model("Enterance", enteranceSchema);

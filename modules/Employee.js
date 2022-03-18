const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  id: String,
  name: String,
  shifts: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Shift",
    },
  ],
});

module.exports = mongoose.model("Employee", employeeSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    return: true,
  },
  dob: {
    type: Date,
  },
  phoneNumber: {
    type: Number,
  },

  File: {
    type: Boolean,
  },
});

module.exports = new mongoose.model("Admin", userSchema);

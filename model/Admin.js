const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  file: {
    type: String,
  },
});

module.exports = new mongoose.model("Admin", userSchema);

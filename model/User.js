const mongoose = require("mongoose");
// mongoose.set("strictQuery", true);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true,
    validate: {
      validator: function (v) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`, // Use template string
    },
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("Login", userSchema);

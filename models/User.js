const mongoose = require("mongoose");

const User = mongoose.model("User", {
  account: {
    username: { type: String, required: true },
    avatar: Object,
  },
  email: { type: String, required: true },
  newsletter: Boolean,
  token: String,
  hash: String,
  salt: String,
});

module.exports = User;

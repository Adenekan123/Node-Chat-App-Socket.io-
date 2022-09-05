const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const schema = new mongoose.Schema({
  nickname: { type: String, trim: true },
  username: { type: String, trim: true, required: true, unique: true },
  email: { type: String, trim: true, required: true, unique: true },
  password: { type: String, trim: true, required: true },
  phone: { type: String, trim: true },
  friends: [
    {
      id: { type: mongoose.Schema.Types.ObjectId },
      username: { type: String, trim: true },
      accepted: { type: Boolean, default: false },
    },
  ],
  groups: [
    {
      id: { type: mongoose.Schema.Types.ObjectId },
      groupname: { type: String, trim: true },
      accepted: { type: Boolean, default: false },
    },
  ],
  date: { type: Date, default: Date.now() },
});

schema.pre("save", async function () {
  const user = this;
  if (user.isDirectModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
});

schema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", schema);

module.exports = User;

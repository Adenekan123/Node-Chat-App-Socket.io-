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
      id: { type: mongoose.Schema.Types.ObjectId, unique: true },
      username: { type: String, required: true, trim: true },
    },
  ],
  groups: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, unique: true },
      groupname: { type: String, required: true, trim: true },
    },
  ],
  date: { type: Date, default: Date.now() },
});

schema.pre("save", function (done) {
  const user = this;
  if (user.isDirectModified("password")) {
    user.password = bcrypt.hash(user.password, 8);
  }
});

schema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

schema.methods.friends = async function (userid) {};

module.exports = User;

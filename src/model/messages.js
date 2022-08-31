const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  clientid: { type: mongoose.Schema.Types.ObjectId, required: true },
  reciever: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    username: { type: String, required: true, trim: true },
  },
  sender: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    username: { type: String, required: true, trim: true },
  },
  message: { type: String, required: true, trim: true },
  date: { type: Date, required: true, default: Date.now() },
});

const Messages = mongoose.model("Messages", schema);

module.exports = Messages;

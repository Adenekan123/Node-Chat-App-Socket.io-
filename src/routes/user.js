const bcrypt = require("bcrypt");
const {
  getConversationsWithUSer,
  getConversationsWithUSers,
} = require("../utils/user.js");
const express = require("express");
const Route = express.Router();

const { friends, chats } = require("../../database");

function auth(req, res, next) {
  if (!req.session.user)
    return res.status(401).json({ error: true, redirecturl: "index.html" });
  req.user = req.session.user;
  next();
}

Route.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) throw new Error("Please fill all fields");

    const user = friends.find((friend) => friend.username == username);
    if (!user) throw new Error("Incorrect pass");
    req.session.user = user;
    req.session.save();
    res.status(200).json({
      error: false,
      user,
      message: "Login Successful",
      redirecturl: "chat.html",
    });
  } catch (err) {
    res.status(401).json({ error: true, message: err.message });
  }
});
Route.get("/logout", async (req, res) => {
  try {
    req.session.destroy();
    return res.status(401).json({ error: true, redirecturl: "index.html" });
  } catch (err) {
    res.status(401).json({ error: true, message: err.message });
  }
});

Route.get("/friends", auth, (req, res) => {
  try {
    res.status(200).json(friends);
  } catch (e) {
    res.status(404).json({ error: true, message: err.message });
  }
});

Route.get("/chats/:id", auth, (req, res) => {
  console.log({ param: req.params.id, user: req.user });
  console.log(chats);
  try {
    const recipientid = req.params.id;
    const conversations = getConversationsWithUSer(
      req.user.id,
      recipientid,
      chats
    );
    res.status(200).json(conversations);
  } catch (err) {
    res.status(404).json({ error: true, message: err.message });
  }
});
Route.get("/chats", auth, (req, res) => {
  try {
    const conversations = getConversationsWithUSers(req.user.id, chats);
    res.status(200).json(conversations);
  } catch (err) {
    res.status(404).json({ error: true, message: err.message });
  }
});

module.exports = Route;

// const bcrypt = require("bcrypt");
const {
  getConversationsWithUSer,
  getLastMessages,
} = require("../utils/user.js");
const express = require("express");
const Route = express.Router();

const User = require("../model/user");
const Messages = require("../model/messages");

// const { friends, chats } = require("../../database");

function auth(req, res, next) {
  if (!req.session.user)
    return res.status(401).json({ error: true, redirecturl: "index.html" });
  req.user = req.session.user;
  next();
}

Route.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !password || !email)
      throw new Error("Please fill all fields");

    const createuser = new User({ username, email, password });
    createuser.save(function (err) {
      if (err) throw new Error(err.message);
      res.status(200).json({
        error: false,
        message: "Account Created Successfully",
        redirecturl: "index.html",
      });
    });
  } catch (err) {
    res.status(401).json({ error: true, message: err.message });
  }
});

Route.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) throw new Error("Please fill all fields");

    const user = await User.findOne({ username: username });
    if (!user || user.length < 1)
      throw new Error("Incorrect username or password");
    if (!(await user.isValidPassword(password)))
      throw new Error("Incorrect username or password");
    req.session.regenerate((err) => {
      if (err) throw new Error("Something went wrong");
      req.session.user = user;
      req.session.save((err) => {
        if (err) throw new Error("Something went wrong");

        res.status(200).json({
          error: false,
          user,
          message: "Login Successful",
          redirecturl: "chat.html",
        });
      });
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

Route.get("/friends", auth, async (req, res) => {
  try {
    const friends = await User.find(
      { _id: req.user._id, "friends.accepted": true },
      { friends: 1 }
    );
    if (!friends) return res.status(200).json([]);
    res.status(200).json(friends);
  } catch (e) {
    res.status(404).json({ error: true, message: e.message });
  }
});
Route.get("/newfriends", auth, async (req, res) => {
  try {
    const friends = await User.find(
      { _id: req.user._id, "friends.accepted": true },
      { friends: 1 }
    );
    const newfriends = await User.find(
      {
        _id: { $ne: req.user._id },
        "friends.id": { $nin: friends },
      },
      { groups: 0, password: 0, date: 0 }
    );
    if (!newfriends) return res.status(200).json([]);
    res.status(200).json(newfriends);
  } catch (e) {
    res.status(404).json({ error: true, message: e.message });
  }
});
Route.get("/friendrequests", auth, async (req, res) => {
  try {
    const friendrequests = await User.find(
      { _id: req.user._id, "friends.accepted": false },
      { friends: 1 }
    ).then(([{ friends }]) => friends.filter((friend) => !friend.accepted));

    if (!friendrequests) return res.status(200).json(["err"]);
    res.status(200).json(friendrequests);
  } catch (e) {
    res.status(404).json({ error: true, message: e.message });
  }
});

Route.get("/messages/:id", auth, async (req, res) => {
  try {
    const clientid = req.params.id;
    const messages = await Messages.find({
      $or: [
        { "reciever.id": req.user._id, "sender.id": clientid },
        { "reciever.id": clientid, "sender.id": req.user._id },
      ],
    });
    if (!messages) return res.status(200).json([]);
    // const conversations = getConversationsWithUSer(
    //   req.user.id,
    //   clientid,
    //   messages
    // );

    res.status(200).json(messages);
  } catch (err) {
    res.status(404).json({ error: true, message: err.message });
  }
});
Route.get("/messages", auth, async (req, res) => {
  try {
    const messages = await Messages.find({
      $or: [{ "reciever.id": req.user._id }, { "sender.id": req.user._id }],
    });
    const conversations = getLastMessages(req.user._id, messages);
    res.status(200).json(conversations);
  } catch (err) {
    res.status(404).json({ error: true, message: err.message });
  }
});

module.exports = Route;

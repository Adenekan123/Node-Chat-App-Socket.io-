const path = require("path");
const http = require("node:http");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { Server } = require("socket.io");
const cors = require("cors");
const { getUser } = require("./src/utils/user.js");
const userRoute = require("./src/routes/user");

//Db
require("./db");

const User = require("./src/model/user");
const Messages = require("./src/model/messages");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

//middlewares
const sessionMiddleware = session({
  secret: "verygoodsecrete",
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    mongoUrl: "mongodb://localhost:27017/masschat",
    ttl: 14 * 24 * 60 * 60,
    autoRemove: "native",
  }),
});
app.use(sessionMiddleware);

//routes
app.use("/user", userRoute);

app.use(cors());

app.use(express.static(path.join("./public/")));
app.use(express.static(path.join("./node_modules/")));

// io.use((socket, next) => {
//   const username = socket.handshake.auth.username;
//   if (!username) {
//     return next(new Error("invalid username"));
//   }
//   socket.username = username;
//   next();
// });

async function setOnlineStatus(socket, status) {
  const response = await User.updateOne({ _id: socket.id }, { active: status });
  if (response._id) {
    //broadcast to all online friends;
    const onlineusers = await User.find(
      { active: true, _id: { $in: socket.friends } },
      { _id: 1 }
    );
    if (onlineusers.length > 0) {
      onlineusers.forEach((user) =>
        socket.broadcast.to(user._id.toString()).emit("onlineStatus", status)
      );
    }
  }
}

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));

io.use((socket, next) => {
  const session = socket.request.session;
  if (session && session.user) {
    socket.id = session.user._id.toString();
    socket.username = session.user.username;
    socket.friends = session.user.friends.map((friend) => friend.id);
    next();
  } else {
    next(new Error("unauthorized"));
  }
});

io.on("connection", (socket) => {
  console.log("New WS connetion");
  socket.emit("message", "Hello!, Welcome to Mass Chat");
  socket.join(socket.id);
  socket.broadcast.emit("message", "A user just joined");
  setOnlineStatus(socket, true);
  //listen to new message
  socket.on("newMessage", async function ({ message, clientid }) {
    const reciever = await User.findOne({ _id: clientid }, { username: 1 });
    const messageObj = {
      clientid,
      message,
      sender: { id: socket.id, username: socket.username },
      reciever: { id: clientid, username: reciever.username },
    };

    console.log(messageObj);

    const newMessage = new Messages(messageObj);
    await newMessage.save();

    socket.broadcast.to(clientid).emit("message", newMessage);

    //add to chats array/table
    // chats.push(newMessage);
    //emit the message back to user
  });

  socket.on("typing", ({ val, clientid }) => {
    socket.broadcast.to(clientid).emit("istyping", val);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("message", "A user just left the chat");
    setOnlineStatus(socket, false);
  });
});

server.listen(8000, () => console.log("Server listening on PORT 8000"));

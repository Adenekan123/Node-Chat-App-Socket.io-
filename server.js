const path = require("path");
const http = require("node:http");
const express = require("express");
const session = require("express-session");
const { Server } = require("socket.io");
const cors = require("cors");
const { chats, friends } = require("./database");
const { getUser } = require("./src/utils/user.js");
const userRoute = require("./src/routes/user");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

//middlewares
const sessionMiddleware = session({
  secret: "verygoodsecrete",
  resave: false,
  saveUninitialized: true,
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

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));

io.use((socket, next) => {
  const session = socket.request.session;
  if (session && session.user) {
    socket.id = session.user.id;
    next();
  } else {
    next(new Error("unauthorized"));
  }
});

io.on("connection", (socket) => {
  console.log("New WS connetion");
  console.log({ socketid: socket.id });
  socket.emit("message", "Hello!, Welcome to Mass Chat");
  socket.join(socket.id);

  socket.broadcast.emit("message", "A user just joined");

  //listen to response
  socket.on("newMessage", function ({ message, clientid }) {
    const newMessage = {
      clientid,
      message,
      from: getUser(socket.id, friends),
      to: getUser(clientid, friends),
    };

    //add to chats array/table
    chats.push(newMessage);
    //emit the message back to user
    socket.broadcast.to(parseInt(clientid)).emit("message", newMessage);
  });

  socket.on("disconnect", () =>
    socket.broadcast.emit("message", "A user just left the chat")
  );
});

server.listen(8000, () => console.log("Server listening on PORT 8000"));

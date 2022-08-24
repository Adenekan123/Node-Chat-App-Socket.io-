const http = require("node:http");
const app = require("express");
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

io.on("conncetion", (socket) => {
  console.log("New WS connetion");

  socket.emit("message", "Hello!, Welcome to Mass Chat");
});

server.listen(8000, () => console.log("Server listening on PORT 8000"));

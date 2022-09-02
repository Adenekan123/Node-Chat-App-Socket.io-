const mongoose = require("mongoose");

const config = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect("mongodb://localhost:27017/masschat", config);
const db = mongoose.connection;
db.on("error", function () {
  console.log("db error");
  console.error.bind(console, "Connection error: ");
});
db.once("open", () => console.log("Db connected"));

const { friends } = require("../database");
function auth(req, res, next) {
  console.log(req.session);
  next();
}

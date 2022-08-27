const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const { friends } = require("../database");

module.exports = function (passport) {
  passport.use(
    new localStrategy(async (username, password, done) => {
      try {
        const user = friends.find((friend) => friend.username == username);
        if (!user) return done(null, false);

        // const isValidPass = await bcrypt.compare(password,user.password);
        // if(!isValidPass) return done(null,false);
        return done(null, user);
      } catch (err) {
        done(null, false);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      if (!user) return done(null, false);
      done(null, user);
    } catch (err) {
      return done(null, false);
    }
  });
};

const passport = require('passport');
const passportJWT = require('passport-jwt');

const JwtStrategy = passportJWT.Strategy;
const { ExtractJwt } = passportJWT;
const { appSecret } = require('../../config');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: appSecret,
};
const middlewares = {};

function createMiddleware(name, getUser) {
  if (!middlewares[name]) {
    const strategy = new JwtStrategy(jwtOptions, (jwtPayload, done) => {
      getUser(jwtPayload)
        .then((user) => {
          if (user) {
            done(null, user);
          } else {
            done(null, false);
          }
        }).catch((err) => {
          done(err, false);
        });
    });

    passport.use(name, strategy);
    middlewares[name] = passport.authenticate(name, { session: false });
  }
  return middlewares[name];
}

module.exports = createMiddleware;

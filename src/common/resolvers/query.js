const { UserInputError } = require('apollo-server');
const {
  verifyPassword,
  createToken,
} = require('../helpers');
const config = require('../../../config');

async function getAccessToken(obj, { email, password }, context) {
  const user = await context.db.models.User.findOne({ email });
  if (!user || !verifyPassword(password, user.password)) {
    throw new UserInputError('Incorrect email or password');
  }
  const { value, expireAt } = createToken(user, config.accessTokenLifeTime);
  return {
    value,
    expireAt,
    user,
  };
}

function renewAccessToken(obj, args, context) {
  const { user } = context;
  if (!user) return null;

  const { value, expireAt } = createToken(user, config.accessTokenLifeTime);
  return {
    value,
    expireAt,
    user,
  };
}

module.exports = {
  getAccessToken,
  renewAccessToken,
};


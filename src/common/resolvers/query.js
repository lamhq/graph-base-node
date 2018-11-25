const config = require('../../../config');

function renewAccessToken(obj, args, context) {
  const { user } = context;
  if (!user) return null;

  const { value, expireAt } = user.createToken(config.accessTokenLifeTime);
  return {
    value,
    expireAt,
    user,
  };
}

module.exports = {
  renewAccessToken,
};


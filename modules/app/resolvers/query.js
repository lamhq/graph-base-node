const { UserInputError } = require('apollo-server');
const {
  verifyPassword,
  createToken,
} = require('../../common/helpers');
const config = require('../../../config');

async function getPosts(obj, args, { db, user }) {
  const { Post } = db.models;
  const filter = {};
  if (!user) {
    filter.status = Post.STATUS_ACTIVE;
  }
  const posts = await Post.find(filter).sort({ _id: -1 });
  return posts;
}

async function getCategories(obj, args, { db }) {
  const { category } = db.models;
  const categories = await category.find().sort({ name: 1 });
  return categories;
}

async function getCategory(obj, { id }, { db }) {
  const { category } = db.models;
  const item = await category.findById(id);
  return item;
}

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
  getPosts,
  getCategories,
  getCategory,
  getAccessToken,
  renewAccessToken,
};


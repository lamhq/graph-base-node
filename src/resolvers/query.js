const config = require('../../config');
const { escapeRegExp } = require('../common/helpers');
const { combineResolvers } = require('graphql-resolvers');
const { requirePermission } = require('../common/helpers');

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

async function getPosts(obj, { s }, { db }) {
  const { Post } = db.models;
  const filter = {
    status: Post.STATUS_ACTIVE,
  };
  if (s) {
    filter.$or = [
      { title: new RegExp(escapeRegExp(s), 'i') },
      { content: new RegExp(escapeRegExp(s), 'i') },
    ];
  }
  const posts = await Post.find(filter).sort({ _id: -1 });
  return posts;
}

async function getCategories(obj, args, { db }) {
  const categories = await db.models.Category.find().sort({ name: 1 });
  return categories;
}

async function getCategory(obj, { id }, { db }) {
  const item = await db.models.Category.findById(id);
  return item;
}

async function getPost(obj, { id }, { db }) {
  const item = await db.models.Post.findById(id);
  return item;
}

async function adminGetProfile(obj, args, { user }) {
  return user;
}

async function adminGetPosts(obj, args, { db }) {
  const posts = await db.models.Post.find().sort({ _id: -1 });
  return posts;
}

async function adminGetPost(obj, { id }, { db }) {
  const post = await db.models.Post.findById(id);
  return post;
}

module.exports = {
  renewAccessToken,
  getPosts,
  getPost,
  getCategories,
  getCategory,
  adminGetProfile: combineResolvers(requirePermission('admin'), adminGetProfile),
  adminGetPosts: combineResolvers(requirePermission('admin'), adminGetPosts),
  adminGetPost: combineResolvers(requirePermission('admin'), adminGetPost),
};


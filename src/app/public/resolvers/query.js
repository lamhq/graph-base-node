const { escapeRegExp } = require('../../../common/helpers');

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

module.exports = {
  getPosts,
  getPost,
  getCategories,
  getCategory,
};


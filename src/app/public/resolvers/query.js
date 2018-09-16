async function getPosts(obj, args, { db }) {
  const { Post } = db.models;
  const posts = await Post.find({ status: Post.STATUS_ACTIVE }).sort({ _id: -1 });
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

module.exports = {
  getPosts,
  getCategories,
  getCategory,
};


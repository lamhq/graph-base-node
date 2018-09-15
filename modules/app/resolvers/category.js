async function getPosts(category, args, { db }) {
  const posts = await db.models.Post.find({ categoryId: category._id }).sort({ _id: -1 });
  return posts;
}

async function getPostCount(category, args, { db }) {
  const no = await db.models.Post.countDocuments({ categoryId: category._id });
  return no;
}

module.exports = {
  posts: getPosts,
  postCount: getPostCount,
};

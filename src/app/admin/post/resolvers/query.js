async function adminGetPosts(obj, args, { db }) {
  const posts = await db.models.Post.find().sort({ _id: -1 });
  return posts;
}

async function adminGetPost(obj, { id }, { db }) {
  const post = await db.models.Post.findById(id);
  return post;
}

module.exports = {
  adminGetPosts,
  adminGetPost,
};


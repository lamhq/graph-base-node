async function getCategory(post, args, context) {
  if (!post.categoryId) {
    return null;
  }
  const category = await context.db.models.Category.findById(post.categoryId);
  return category;
}

async function getAuthor(post, args, context) {
  if (!post.authorId) {
    return null;
  }
  const user = await context.db.models.User.findById(post.authorId);
  return user;
}

module.exports = {
  category: getCategory,
  author: getAuthor,
};

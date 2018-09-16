const { UserInputError } = require('apollo-server');
const { validatePost } = require('../helpers');

async function adminAddPost(category, { data }, { db }) {
  const post = new db.models.Post();
  const errors = validatePost(data);
  if (errors) {
    throw new UserInputError('Please correct your inputs', errors);
  }

  post.title = data.title;
  post.content = data.content;
  post.categoryId = data.categoryId;
  post.status = data.status;
  await post.save();
  return post;
}

async function adminUpdatePost(category, { id, data }, { db }) {
  const post = db.models.Post.findById(id);
  if (!post) {
    throw new UserInputError('Post not found');
  }

  const errors = validatePost(data);
  if (errors) {
    throw new UserInputError('Please correct your inputs', errors);
  }

  post.title = data.title;
  post.content = data.content;
  post.categoryId = data.categoryId;
  post.status = data.status;
  await post.save();
  return post;
}

module.exports = {
  adminAddPost,
  adminUpdatePost,
};

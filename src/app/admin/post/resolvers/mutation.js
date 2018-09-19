const { combineResolvers } = require('graphql-resolvers');
const { requirePermission } = require('../../../../common/helpers');
const { UserInputError } = require('apollo-server');
const { validatePost } = require('../helpers');

async function adminAddPost(category, { data }, { db }) {
  const post = new db.models.Post();
  const inputErrors = validatePost(data);
  if (inputErrors) {
    throw new UserInputError('Please correct your inputs', { inputErrors });
  }

  post.title = data.title;
  post.content = data.content;
  post.categoryId = data.categoryId;
  post.status = data.status;
  await post.save();
  return post;
}

async function adminUpdatePost(category, { id, data }, { db }) {
  const post = await db.models.Post.findById(id);
  if (!post) {
    throw new UserInputError('Post not found');
  }

  const inputErrors = validatePost(data);
  if (inputErrors) {
    throw new UserInputError('Please correct your inputs', { inputErrors });
  }

  post.title = data.title;
  post.content = data.content;
  post.categoryId = data.categoryId;
  post.status = data.status;
  await post.save();
  return post;
}

async function adminDeletePost(category, { id }, { db }) {
  const post = await db.models.Post.findById(id);
  if (!post) {
    throw new UserInputError('Post not found');
  }

  await post.remove();
  return post;
}

module.exports = {
  adminAddPost: combineResolvers(requirePermission('admin'), adminAddPost),
  adminUpdatePost: combineResolvers(requirePermission('admin'), adminUpdatePost),
  adminDeletePost: combineResolvers(requirePermission('admin'), adminDeletePost),
};

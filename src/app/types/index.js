const Category = require('./category.gql');
const PostStatus = require('./post-status.gql');
const Post = require('./post.gql');
const User = require('./user.gql');

module.exports = [
  Post,
  PostStatus,
  Category,
  User,
];

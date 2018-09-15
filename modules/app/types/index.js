const AccessToken = require('./access-token.gql');
const Category = require('./category.gql');
const PostStatus = require('./post-status.gql');
const Post = require('./post.gql');
const Query = require('./query.gql');
const User = require('./user.gql');
const Date = require('./date.gql');

module.exports = [
  Query,
  AccessToken,
  Post,
  PostStatus,
  Category,
  User,
  Date,
];

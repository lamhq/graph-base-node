const AccessToken = require('./access-token.gql');
const Category = require('./category.gql');
const PostStatus = require('./post-status.gql');
const Post = require('./post.gql');
const User = require('./user.gql');
const Query = require('./query.gql');
const Mutation = require('./mutation.gql');
const Date = require('./date.gql');

module.exports = [
  User,
  AccessToken,
  Date,
  Query,
  Mutation,
  Post,
  PostStatus,
  Category,
  User,
];

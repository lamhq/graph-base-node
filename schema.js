const { gql } = require('apollo-server');

// The GraphQL schema
const schema = gql`
scalar Date

type Query {
  getPosts: [Post]
  getAccessToken(email: String, password: String): AccessToken
  getCategories: [Category]
  getCategory(id: ID): Category
}

type User {
  id: ID,
  email: String
  firstname: String
  lastname: String
  username: String
  roles: [String]
  status: String
  post: [Post]
}

type Category {
  id: ID,
  name: String
  parent: Category
  posts: [Post]
  postCount: Int
}

type Post {
  id: ID,
  title: String
  content: String
  createdAt: Date
  category: Category
  author: User
}

type AccessToken {
  value: String
  expireAt: String
  user: User
}
`;

module.exports = schema;

const { buildSchema } = require('graphql');
const graphqlHTTP = require('express-graphql');
// const resolver = require('./resolver');

const schema = buildSchema(`
type Query {
  hello: String
  posts: [Post]
  post(id: ID!): Post
}

type Post {
  id: ID!,
  title: String!,
  content: String
}
`);

const Post = require('../app/models/post');

// The root provides a resolver function for each API endpoint
const resolver = {
  hello: () => 'Hello world!',
  posts: () => Post.find().sort({ _id: -1 }),
  post: args => Post.findById(args.id),
  Post: {
    id: () => Math.random() * 10,
    name: () => 'test',
    content: () => 'content',
  },
};


module.exports = graphqlHTTP({
  schema,
  rootValue: resolver,
  graphiql: true,
});

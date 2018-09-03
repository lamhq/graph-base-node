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
  content: String,
  publishedAt: String
}
`);

const Post = require('../app/models/post');

class MyPost {
  constructor(post) {
    this.post = post;
  }

  id() {
    return this.post._id.toString();
  }

  title() {
    return this.post.title;
  }

  publishedAt() {
    const d = new Date(this.post.createdAt);
    return d.toISOString();
  }
}

// The root provides a resolver function for each API endpoint
const resolver = {
  hello: () => 'Hello world!',
  posts: () => Post.find().sort({ _id: -1 }),
  post: async (args) => {
    const item = await Post.findById(args.id);
    return new MyPost(item.toObject());
  },
};


module.exports = graphqlHTTP({
  schema,
  rootValue: resolver,
  graphiql: true,
});

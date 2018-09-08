const mongoose = require('mongoose');

const { Schema } = mongoose;

const postSchema = Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  authorId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;

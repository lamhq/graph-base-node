const mongoose = require('mongoose');

const { Schema } = mongoose;

const STATUS_ACTIVE = 'Active';
const STATUS_INACTIVE = 'Inactive';

const postSchema = Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  authorId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: [
      STATUS_ACTIVE,
      STATUS_INACTIVE,
    ],
  },
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

Post.STATUS_ACTIVE = STATUS_ACTIVE;
Post.STATUS_INACTIVE = STATUS_INACTIVE;

module.exports = Post;

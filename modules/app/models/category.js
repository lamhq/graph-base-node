const mongoose = require('mongoose');

const { Schema } = mongoose;

// define schema
const categorySchema = Schema({
  name: { type: String, required: true },
  parent: { type: Schema.Types.ObjectId, ref: 'Category' },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;

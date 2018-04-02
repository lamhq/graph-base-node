var mongoose = require('mongoose')
var Schema = mongoose.Schema

var fileSchema = new Schema({
  url: { type: String },
  filename: { type: String },
  type: { type: String },
  meta: {
    ['s3-bucket']: { type: String },
    ['s3-region']: { type: String },
    ['s3-key']: { type: String },
  },
})

var File = mongoose.model('cm.files', fileSchema)

module.exports = File


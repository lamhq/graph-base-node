var mongoose = require('mongoose')
var { encryptPassword, verifyPassword, createToken } = require('../helpers')

var userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true })

userSchema.methods.setPassword = function (value) {
  this.password = encryptPassword(value)
}

userSchema.methods.checkPassword = function (value) {
  return verifyPassword(value, this.password)
}

// create json web token present for this user
userSchema.methods.createToken = function (duration = '1h') {
  return createToken(this, duration)
}

var User = mongoose.model('common.users', userSchema)

module.exports = User


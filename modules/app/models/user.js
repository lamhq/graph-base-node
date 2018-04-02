const mongoose = require('mongoose');
const passwordGenerator = require('generate-password');
const {
  encryptPassword,
  verifyPassword,
  createToken,
} = require('../../common/helpers');

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, required: true },
  profile: {
    firstname: { type: String },
    lastname: { type: String },
    phone: { type: String },
  },
}, { timestamps: true });

// user method for setting password
userSchema.methods.setPassword = function setPassword(value) {
  this.password = encryptPassword(value);
};

// user method for validating password
userSchema.methods.checkPassword = function checkPassword(value) {
  return verifyPassword(value, this.password);
};

// set random password and return random generated password to send to user
userSchema.methods.autoSetRandomPassword = function setRandomPassword(len = 10) {
  const password = passwordGenerator.generate({
    length: len,
    numbers: true,
  });
  this.setPassword(password);
  return password;
};

// create json web token that present this user
userSchema.methods.createToken = function createUserToken(duration = '1h') {
  return createToken(this, duration);
};

// define mogoose model
const User = mongoose.model('common.users', userSchema);

// available user statuses
User.STATUS_PENDING = 'Pending';
User.STATUS_ACTIVE = 'Active';
User.STATUS_INACTIVE = 'Inactive';
User.STATUS_DECLINED = 'Declined';

module.exports = User;

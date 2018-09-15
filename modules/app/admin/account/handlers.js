const createMiddleware = require('../../common/jwt');
const User = require('../models/user');
const {
  validationExc,
  notFoundExc,
  verifyToken,
} = require('../../common/helpers');
const {
  validateLoginData,
  validateRegistrationData,
  validateProfileData,
  validateForgotPwdData,
  validateResetPwdData,
  sendMailRequestResetPwd,
} = require('./helpers');

async function login(req, res, next) {
  try {
    var data = req.body
    var errors = validateLoginData(data)
    if (errors) {
      return next(validationExc('Please correct your input.', errors))
    }

    var user = await User.findOne({ email: data.loginId })
    if (!user || !user.checkPassword(data.password)) {
      return res.status(400).json(validationExc('Invalid login information.',
        { password: ['Incorrect username or password'] }))
    }

    res.json({
      token: user.createToken(data.remember ? '30 days' : '3h'),
      username: user.username,
      id: user._id
    })
  } catch (err) {
    next(err)
  }
}

async function getProfile(req, res, next) {
  try {
    var user = await User.findById(req.user._id)
    if (user) {
      return res.json({ email: user.email, username: user.username })
    } else {
      next(notFoundExc('No profile data found'))
    }
  } catch (err) {
    next(err)
  }
}

async function updateProfile(req, res, next) {
  try {
    var user = await User.findById(req.user._id)
    var data = req.body
    if (user) {
      let errors = validateProfileData(data, user)
      if (errors) {
        next(validationExc('Please check your form input', errors))
      } else {
        user.email = data.email
        user.username = data.username
        if (data.password)
          user.setPassword(data.password)
        var saved = await user.save()
        res.json({ username: saved.username, email: saved.email })
      }
    } else {
      next(notFoundExc('No profile data found'))
    }
  } catch (err) {
    next(err)
  }
}

const verifyUserToken = createMiddleware('jwtAdmin', jwtPayload => User.findById(jwtPayload.userId))

async function requestResetPassword(req, res, next) {
  try {
    const data = req.body;
    const errors = await validateForgotPwdData(data);
    if (errors) {
      return next(validationExc('Please correct your input.', errors));
    }

    const user = await User.findOne({
      email: data.email,
    });
    sendMailRequestResetPwd(user);
    return res.json({ message: 'Please check your email.' });
  } catch (err) {
    return next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const data = req.body;
    const errors = await validateResetPwdData(data);
    if (errors) {
      return next(validationExc('Please correct your input.', errors));
    }

    const decoded = verifyToken(data.token);
    const user = await User.findOne({
      _id: decoded.userId,
      status: User.STATUS_ACTIVE,
    });
    user.setPassword(data.password);
    await user.save();

    return res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    return next(err);
  }
}

// user register
async function register(req, res, next) {
  try {
    const data = req.body;
    const { fields, dryRun } = req.query;
    let errors;

    // if dry run, only perform validation and return validation result
    if (dryRun) {
      errors = await validateRegistrationData(data, fields);
      return errors
        ? next(validationExc('Invalid registration data', errors))
        : res.json('Validation completed successfully, no errors found.');
    }

    errors = await validateRegistrationData(data);
    if (errors) {
      return next(validationExc('Please correct your input.', errors));
    }

    const user = new User({
      ...data,
      status: User.STATUS_ACTIVE,
    });
    await user.save();
    // sendMailRegistrationToUser(user);
    // sendMailRegistrationToAdmin(user);

    const { __v, password, ...safeData } = user.toObject();
    return res.json(safeData);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  login,
  register,
  getProfile,
  updateProfile,
  verifyUserToken,
  requestResetPassword,
  resetPassword,
};

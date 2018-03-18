const createMiddleware = require('../common/jwt')
const User = require('../common/models/user')
const {
  validationExc,
  notFoundExc,
} = require('../common/helpers')
const { validateLoginForm, validateProfileData } = require('./helpers')

async function login(req, res, next) {
  try {
    var data = req.body
    var errors = validateLoginForm(data)
    if (errors) {
      return next(validationExc('Please correct your input.', errors))
    }

    var user = await User.findOne({ username: data.loginId })
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

const verifyAdminToken = createMiddleware('jwtAdmin', jwtPayload => User.findById(jwtPayload.userId))

module.exports = {
  login,
  getProfile,
  updateProfile,
  verifyAdminToken,
}
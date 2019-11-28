//Think of this file as an extension of our server "index.js"
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

// This is the passport
function initialize(passport, getUserByEmail, getUserById) {
  // The Authentication
  const authenticateUser = async (email, password, done) => {
    const user = getUserByEmail(email)
    // Check Username
    if (user == null) {
      // "done" needs to be called everytime the function should finish
      return done(null, false, { message: 'No user with that email' })
    }

    // Check Password
    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
    }
  }

  // No idea
  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}

// Allow this file to be called
module.exports = initialize
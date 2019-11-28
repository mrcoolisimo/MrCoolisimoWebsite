if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

//GETTING STARTED----------------------------------
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

app.set('view-engine', 'ejs')

// Create a passport by calling upon that file we made
const initializePassport = require('./passportConfig')
initializePassport(
    passport,
    // Identify user based on email and ID
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
  )

// Start looking in this directory
app.use(express.static(__dirname + '/public'));
// Allows express to read from HTML inputs
app.use(express.urlencoded({ extended:false }))
// Shows messages?
app.use(flash())
// Secures user session
app.use(session({
    // Create secret session key
    secret: process.env.SESSION_SECRET,
    // Save if nothing changed? 
    resave: false,
    // Save empty value?
    saveUninitialized: false
}))
// Creates authentication
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

//We're using this in place of a database. Resets everytime we reset the server.
const users = []

// ROUTES-------------------------------------------
app.get('/', checkAuthenticated, (req,res) => {
    res.render('index.ejs',{ name: req.user.name })
});
app.get('/login', checkNotAuthenticated, (req,res) => {
    res.render('login.ejs')
});
app.get('/register', (req,res) => {
    res.render('register.ejs')
});
app.get('/homepage', (req,res) => { 
    res.render('homepage.ejs')
});

// POSTS---------------------------------------------
app.post('/register', async (req,res) => {
    try {
        //What was in the password field? Then hash it
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            // Databases usually do this for you
            id: Date.now().toString(),
            //What was in the name field?
            name: req.body.name,
            //Email field?
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch (e) {
    res.redirect('/register')    
    }
    console.log(users)   
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect:'/homepage',
    failureRedirect: '/login',
    failureFlash: true
}))

// LOGOUT----------------------------------------------
app.delete('/logout', (req,res) => {
    req.logout()
    res.redirect('/login')
})

// CHECKS----------------------------------------------
function checkAuthenticated(req,res,next) {
    if(req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req,res,next) {
    if(req.isAuthenticated()) {
        res.redirect('/homepage')
    }
    next()
}

// PORT------------------------------------------------
app.listen(3001)
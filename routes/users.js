const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/user');
const app = express();

app.use(express.static(__dirname + '/public'));

// ROUTES
router.get('/login', (req,res) => res.render('login'));
router.get('/register', (req,res) => res.render('register'));

// POSTS
router.post('/register', (req,res) => {
    const {name, email, password, password2} = req.body;
    let errors = []

    // Check required fields
    if(!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    // Check passwords match
    if(password !== password2) {
        errors.push({msg: 'Passwords do no match'});
    }

    // Check password length
    if(password.length < 6) {
        errors.push({msg: 'Password should be at least 6 characters'})
    }

    if(errors.length > 0){
        res.render('register', {
            // This is the equivalent to errors:errors, name:name, just shortened
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        // Validation Passed (findOne is a mongoose method)
        // We plug in our email variable that the user created (find one { email: w@w})
        // Then we search our Mongo db for a user with that email
        // If there turns up a match, this user already exists (look up promises sometime)
        // Otherwise, we'll create the user called 'newUser'
        User.findOne({ email: email }).then(user => {
            if (user) {
              errors.push({ msg: 'Email already exists' });
              res.render('register', {
                errors,
                name,
                email,
                password,
                password2
              });

            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                });

                // Hash Password
                bcrypt.genSalt(10, (err,salt) => bcrypt.hash(newUser.password, salt, (err,hash) => {
                    if(err) throw err;
                    // Set password to the hashed version
                    newUser.password = hash;
                    // Save the registered user to MongoAtlas
                    newUser.save()
                        .then(user => {
                            req.flash('success_msg', 'You are now registered and can log in');
                            res.redirect('/users/login')
                        })
                        .catch(err => console.log(err));
                }))
            }
            });
    }
});

// Login Handle
router.post('/login', (req,res,next) => {
    passport.authenticate('local', {
        successRedirect: '/homepage',
        failureRedirect: '/users/login',
        failureFlash: true
    }) (req,res,next);
})

module.exports= router;
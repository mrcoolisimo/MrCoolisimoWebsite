const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth');

// "Get" the URL requested and "Render" the view with this name
router.get('/', (req,res) => res.render('homepage'));
router.get('/homepage', (req,res) => res.render('homepage'));
router.get('/dashboard', ensureAuthenticated, (req,res) => 
    res.render('dashboard', {
        name: req.user.name
    }));
router.get('/chat', ensureAuthenticated, (req,res) => { 
    res.render('chat', {name: req.user.name})
})

module.exports = router;
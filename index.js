//app.js//

// Basic Setup --------------------------------------

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const mongo = require('mongodb').MongoClient; 
const passport = require('passport');
const socket = require('socket.io');
const flash = require('connect-flash');
const session = require('express-session');

// Server Config
const app = express();
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log(`Server started on port ${PORT}`));

// DB Config 
const db = require('./config/keys').MongoURI
mongoose.connect(db, {useNewUrlParser: true})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err))

// Passport Config
require('./config/passport')(passport);

// Enable EJS readability
app.use(expressLayouts);
app.set('view engine', 'ejs'); 

// Bodyparser -- Lets us get data from html files
app.use(express.urlencoded({ extended: false}))


// Creating the redirect message ----------------------

// Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  }));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());

// Global vars
app.use((req,res,next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// SOCKETS ------------------------------

const io = socket(server);

//Connect Mongo
mongo.connect('mongodb://localhost/MRCOOLISIMOCHAT', (err, client) => {
    if (err) throw err;
    console.log('MongoDB Connected');

    // Handle Chat Event -- Listens for event called "connection"
    io.on('connection', (socket) => {
        // Socket ID is a unique code for each connected user assigned upon connecting
        console.log('made socket connection',socket.id);


        const chat = client.db('MRCOOLISIMOCHAT');

        //Chat History
        chat.collection('chats').find().limit(100).sort({_id:1}).toArray((err,res) => {
            if (err) throw err;
            // Emit messages
            socket.emit('chatHistory', res);
            // console.log(res);
        });

        socket.on('chat', function(data){
            io.sockets.emit('chat', data);
            

            console.log('message received', data);

            chat.collection('chats').insertOne(data);
        });

        socket.on('typing', function(data){
            socket.broadcast.emit("typing", data);
        });
    });
});

// Actual Server --------------------------------------

// Look here for ejs pages
app.use(express.static(__dirname + '/public'));

// ROUTES
app.use('/', require('./routes/index'));  
app.use('/users', require('./routes/users'));


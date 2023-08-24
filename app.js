// connecting express
const express = require('express');
const path = require('path');
// connecting mongoose
const mongoose = require('mongoose');
// requiring ejs mate
const ejsMate = require('ejs-mate');
const session = require('express-session');
// requiring ExpressError class
const ExpressError = require('./utils/ExpressError');
// requiring method override
const methodOverride = require('method-override');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    // passing in options
    useNewUrlParser: true,
    useUnifiedTopology: true
    // useFindAndModify: false no longer required
})

// logic to check if there is error
const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log('Database connected');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// tell express to parse the body; this is for the post req with 😱😱😱
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 100 * 60 * 60 * 24 * 7,
        maxAge: 100 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

// specify router we wanna use (campgrounds), and path we wanna prefix it with
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

// home route
app.get('/', (req, res) => {
    res.render('home')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404))
})

// set up default error handler w/ error template that we render
// error handlers MUST follow all async functions
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'oh no!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('serving on port 3000!')
})

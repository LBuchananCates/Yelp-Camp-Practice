// connecting express
const express = require('express');
const path = require('path');
// connecting mongoose
const mongoose = require('mongoose');
// requiring ejs mate
const ejsMate = require('ejs-mate');
// destructing b/c will eventually have multiple schemas to export
const { campgroundSchema, reviewSchema } = require('./schemas.js');
// catch requirement
const catchAsync = require('./utils/catchAsync');
// requiring ExpressError class
const ExpressError = require('./utils/ExpressError');
// requiring method override
const methodOverride = require('method-override');
// requiring model
const Campground = require('./models/campground');
const Review = require('./models/review');

const campgrounds = require('./routes/campgrounds')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    // passing in options
    useNewUrlParser: true,
    useUnifiedTopology: true
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
// set up method override 🫠🫠🫠
app.use(methodOverride('_method'));



const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// specify router we wanna use (campgrounds), and path we wanna prefix it with
app.use('/campgrounds', campgrounds)

// home route
app.get('/', (req, res) => {
    res.render('home')
})

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

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

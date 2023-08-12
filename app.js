// connecting express
const express = require('express');
const path = require('path');
// connecting mongoose
const mongoose = require('mongoose');
// requiring ejs mate
const ejsMate = require('ejs-mate');
// destructing b/c will eventually have multiple schemas to export
const { campgroundSchema } = require('./schemas.js');
// catch requirement
const catchAsync = require('./utils/catchAsync');
// requiring ExpressError class
const ExpressError = require('./utils/ExpressError');
// requiring method override
const methodOverride = require('method-override');
// requiring model
const Campground = require('./models/campground');

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

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// home route
app.get('/', (req, res) => {
    res.render('home')
})

// diff routes for campgrounds
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
    // { campgrounds } for index.ejs to work/display!
}));

// route for creating-new-campground form should come first
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

// setting up endpoint as post to which form is submitted 😱😱😱
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);

    const campground = new Campground(req.body.campground);
    await campground.save();
    // redirect to newly created campground
    res.redirect(`/campgrounds/${campground._id}`)
}));

// route for individual campground
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    // find by id: pass in the id with req.params.id
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', { campground });
}));

// route for editing
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    // looking up cg by id
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}));

// after method override 🫠🫠🫠
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    // this gives us the id
    const { id } = req.params;
    // second argument is query to update
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    // redirect to campground showpage of campground just updated
    res.redirect(`/campgrounds/${campground._id}`)
}));

// delete route; needs id included
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    // take id to destructure it
    const { id } = req.params;
    // to delete: find info about cg and remove
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
    // then make button to send delete request, go to showpage
}));

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

// connecting express
const express = require('express');
const path = require('path');
// connecting mongoose
const mongoose = require('mongoose');
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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// tell express to parse the body; this is for the post req with 😱😱😱
app.use(express.urlencoded({extended:true}))

// home route
app.get('/', (req, res) => {
    res.render('home')
})

// diff routes for campgrounds
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
    // { campgrounds } for index.ejs to work/display!
})

// route for creating-new-campground form should come first
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

// route for individual campground
app.get('/campgrounds/:id', async (req, res) => {
    // find by id: pass in the id with req.params.id
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', {campground});
})

// setting up endpoint as post to which form is submitted 😱😱😱
app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    // redirect to newly created campground
    res.redirect(`/campgrounds/${campground._id}`)
})


app.listen(3000, () => {
    console.log('serving on port 3000!')
})

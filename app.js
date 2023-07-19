// connecting express
const express = require('express');
const path = require('path');
// connecting mongoose
const mongoose = require('mongoose');
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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// tell express to parse the body; this is for the post req with 😱😱😱
app.use(express.urlencoded({extended:true}))
// set up method override 🫠🫠🫠
app.use(methodOverride('_method'));

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

// setting up endpoint as post to which form is submitted 😱😱😱
app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    // redirect to newly created campground
    res.redirect(`/campgrounds/${campground._id}`)
})

// route for individual campground
app.get('/campgrounds/:id', async (req, res) => {
    // find by id: pass in the id with req.params.id
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', {campground});
})

// route for editing
app.get('/campgrounds/:id/edit', async (req, res) => {
    // looking up cg by id
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground});
})

// after method override 🫠🫠🫠
app.put('/campgrounds/:id', async(req, res) => {
    // this gives us the id
    const {id} = req.params;
    // second argument is query to update
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    // redirect to campground showpage of campground just updated
    res.redirect(`/campgrounds/${campground._id}`)
});

// delete route; needs id included
app.delete('/campgrounds/:id', async (req, res) => {
    // take id to destructure it
    const {id} = req.params;
    // to delete: find info about cg and remove
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
    // then make button to send delete request, go to showpage
})

app.listen(3000, () => {
    console.log('serving on port 3000!')
})

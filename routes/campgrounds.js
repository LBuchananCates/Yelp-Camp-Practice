const express = require('express');
const router = express.Router();
// catch requirement
const catchAsync = require('../utils/catchAsync');
// destructing b/c will eventually have multiple schemas to export
const { campgroundSchema } = require('../schemas.js');
// requiring ExpressError class
const ExpressError = require('../utils/ExpressError');
// requiring model
const Campground = require('../models/campground');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


// diff routes for campgrounds
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
    // { campgrounds } for index.ejs to work/display!
}));

// route for creating-new-campground form should come first
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

// setting up endpoint as post to which form is submitted 😱😱😱
router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);

    const campground = new Campground(req.body.campground);
    await campground.save();
    // redirect to newly created campground
    res.redirect(`/campgrounds/${campground._id}`)
}));

// route for individual campground
router.get('/:id', catchAsync(async (req, res) => {
    // find by id: pass in the id with req.params.id
    const campground = await Campground.findById(req.params.id).populate('reviews');
    console.log(campground)
    res.render('campgrounds/show', { campground });
}));

// route for editing
router.get('/:id/edit', catchAsync(async (req, res) => {
    // looking up cg by id
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}));

// after method override 🫠🫠🫠
router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    // this gives us the id
    const { id } = req.params;
    // second argument is query to update
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    // redirect to campground showpage of campground just updated
    res.redirect(`/campgrounds/${campground._id}`)
}));

// delete route; needs id included
router.delete('/:id', catchAsync(async (req, res) => {
    // take id to destructure it
    const { id } = req.params;
    // to delete: find info about cg and remove
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
    // then make button to send delete request, go to showpage
}));

module.exports = router;
// requires mongoose
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// making schema
const CampgroundSchema = new Schema({
    title: String,
    price: String,
    description: String,
    location: String
});

// export the model
module.exports = mongoose.model('Campground', CampgroundSchema);
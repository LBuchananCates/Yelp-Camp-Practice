// connecting mongoose
const mongoose = require('mongoose');
// import cities array
const cities = require('./cities');
// import and destructure
const {places, descriptors} = require('./seedhelpers');
// requiring model
const Campground = require('../models/campground');

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

// pass in array, return element from it; this is its own function
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        // there are 1000 cities
        const random1000 = Math.floor(Math.random() * 1000);
        // make new campground
        const camp = new Campground({
        // set location to be city, state
        location: `${cities[random1000].city}, ${cities[random1000].state}}`,
        // to pick random element from array
        title: `${sample(descriptors)} ${sample(places)}`
       })
        // saves
        await camp.save();
    }
}

// clsing database
seedDB().then(() => {
    mongoose.connection.close;
});
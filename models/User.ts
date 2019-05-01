const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        title: String,
        first: String,
        last: String
    },
    picture: {
        large: String,
        medium: String,
        thumbnail: String
    },

    assigned: {type: Boolean, default: false}
});


// Export the user model
module.exports = mongoose.model('User', userSchema);
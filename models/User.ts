const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        title: String,
        first: {type:String, index: true},
        last: {type:String, index: true}
    },
    picture: {
        large: String,
        medium: String,
        thumbnail: String
    },

    assigned: {type: Boolean, default: false}
});

// Add text index to first name and last name with equal weightage
userSchema.index({ "name.first" : 'text', "name.last" : 'text' });


// Export the user model
module.exports = mongoose.model('User', userSchema);
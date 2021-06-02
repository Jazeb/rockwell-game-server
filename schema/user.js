const mongoose = require('mongoose').set('debug', true);
const Schema = mongoose.Schema;

const User = Schema({
    user_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    }
}, { collection: 'people' }, { __v: false });

module.exports = mongoose.model('users', User);
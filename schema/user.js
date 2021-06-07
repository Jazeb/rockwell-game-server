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
    },
    auth_code: {
        type: String,
        required: true
    },
    is_admin:{
        type: Boolean,
        required: true,
        default:false
    },
    is_verified:{
        type: Boolean,
        required: true,
        default:false
    },
    coins:{
        type: Number,
        required:false,
        default: 0,
        min: 0
    }
}, { collection: 'users' }, { __v: false });

module.exports = mongoose.model('users', User);
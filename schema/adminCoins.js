const mongoose = require('mongoose').set('debug', true);
const Schema = mongoose.Schema;

const AdminCoins = Schema({
    coins_sent:{
        type: Number,
        required:true,
    },
    email:{
        type: String,
        required:true,
    },
    user_name:{
        type: String,
        required:true,
    },
    date:{
        type: Date,
        default: new Date(),
        required:true,
    }
}, { collection: 'admin_coins' }, { __v: false });

module.exports = mongoose.model('admin_coins', AdminCoins);
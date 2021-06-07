const mongoose = require('mongoose').set('debug', true);
const Schema = mongoose.Schema;

const Coins_Limit = Schema({
    coins_limit:{
        type: Number,
        required:false,
        default: 0,
        min: 0
    }
}, { collection: 'coins_limit' }, { __v: false });

module.exports = mongoose.model('coins_limit', Coins_Limit);
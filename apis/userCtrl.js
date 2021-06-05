const express = require('express');
const router = express.Router();

const resp = require('../resp');
const sendMail = require('../utils/mailer');

const User = require('../schema/user');

router.put('/add/coins', (req, res) => {
    const { coins, user_id } = req.body;
    if (!coins || coins <= 0) return resp.error(res, 'Provide coins to update');
    if (!user_id) return resp.error(res, 'Provide user id');

    User.findOne({ _id: user_id }).then((user) => {
        if (!user) return resp.error(res, 'User not found');
        user.coins = user.coins + coins;
        user.save((err, result) => {
            if (err) return resp.success(res, null, err.message);
            return resp.success(res, 'Coins updated');
        });
    }).catch(err => resp.success(res, null, err.message));
});

router.post('/resetPassword', async(req, res) => {
    const { email } = req.body;
    if(!email) return resp.error(res, 'Provide email');
    const result = await sendMail(email);
    if(result) return resp.success(res, 'Password updated successfully');
    else resp.error(res, 'User does not exist');
});

module.exports = router;
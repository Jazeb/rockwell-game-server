const express = require('express');
const router = express.Router();

const resp = require('../resp');
const mailer = require('../utils/mailer');
const authenticateToken = require('../auth');
const shared = require('../utils/shared');

const User = require('../schema/user');
const CoinsLimit = require('../schema/coinsLimit');

router.put('/add/coins', authenticateToken, (req, res) => {
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

router.post('/resetPassword', async (req, res) => {
    const { email } = req.body;
    if (!email) return resp.error(res, 'Provide email');
    const result = await mailer.sendMail(email);
    if (result) return resp.success(res, 'Email sent to user');
    else resp.error(res, 'User does not exist');
});

router.post('/sendCoins', authenticateToken, async (req, res) => {
    const { is_admin } = req.user;
    const coins = req.body.coins;
    if (!is_admin) {
        const _id = req.user._id;
        const user_coins = await User.findOne({ _id }, { coins: 1 });
        if (user_coins.coins < coins) return resp.error(res, 'Insufficient coins');
        const limit = await CoinsLimit.findOne({});
    }
});

router.post('/verifyCode', (req, res) => {
    const { auth_code, email } = req.body;
    if (!auth_code || !email) return resp.error(res, 'Provide auth code and email');

    User.findOne({ email }).then(data => {
        if (auth_code !== data.reset_password_code) return resp.error(res, 'Invalid code');
        return resp.success(res, 'Token is verified');
    }).catch(err => resp.error(res, err));
});



router.post('/updatePassword', async (req, res) => {
    const { email, new_password, confirm_password } = req.body;
    if (!email || !new_password || !confirm_password) return resp.error(res, 'Provide new and confirm password');

    if (new_password !== confirm_password) return resp.error(res, 'Password does not match');

    const password = shared.hashPwd(new_password);
    User.findOneAndUpdate({ email }, { password }).then(rs => {
        return resp.success(res, 'Password is updated.');
    }).catch(err => resp.error(res, err));
});

module.exports = router;
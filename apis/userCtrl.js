const express = require('express');
const router = express.Router();

const resp = require('../resp');
const mailer = require('../utils/mailer');
const authenticateToken = require('../auth');
const shared = require('../utils/shared');
const FCM = require('fcm-node');

const User = require('../schema/user');
const CoinsLimit = require('../schema/coinsLimit');

router.get('/', async (req, res) => {
    if (req.session.loggedin) {
        const { _id } = req.session.user.user;
        const { coins_limit } = await CoinsLimit.findOne();
        const { coins } = await User.findOne({ _id });

        return res.render('home', { coins_limit, coins });
    }
    else return res.render('login');
});

// Admin will manually add coins to any user
router.post('/add/coins', (req, res) => {
    const { coins, user_id } = req.body;
    if (!coins || coins <= 0) return resp.error(res, 'Provide coins to update');
    if (!user_id) return resp.error(res, 'Provide user id');

    User.findOne({ _id: user_id }).then((user) => {
        if (!user) return resp.error(res, 'User not found');
        user.coins = user.coins + +coins;
        user.save((err, result) => {
            if (err) return resp.success(res, null, err.message);
            return res.redirect('/user/all');
        });
    }).catch(err => resp.success(res, null, err.message));
});

router.post('/resetPassword', async (req, res) => {
    const { email } = req.body;
    if (!email) return resp.error(res, 'Provide email');
    const result = await mailer.sendPasswordResetMail(email);
    if (result) return resp.success(res, 'Email sent to user');
    else resp.error(res, 'User does not exist');
});

router.post('/sendCoins', authenticateToken, async (req, res) => {
    const { _id } = req.user;
    const { coins } = req.body;

    if (!coins) return resp.error(res, 'Provide coins you want to send');
    const user_coins = await User.findOne({ _id }, { coins: 1 });
    if (!user_coins) return resp.error(res, 'User does not exist');
    const { coins_limit } = await CoinsLimit.findOne({});

    if (user_coins.coins < coins) return resp.error(res, 'Insufficient coins');
    if (coins > coins_limit) return resp.error(res, `Not allowed to send more than ${coins_limit} coins`);
    User.findOneAndUpdate({ is_admin: true }, { $inc: { coins } })
        .then(_ => resp.success(res, 'Coins sent to admin'))
        .catch(err => resp.error(res, 'Error sending coins to admin', err));
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

router.get('/all', (req, res) => {

    User.find({ is_admin: false }).then(async users => {
        const { _id } = req.session.user.user;
        const { coins_limit } = await CoinsLimit.findOne();
        const { coins } = await User.findOne({ _id });
        return res.render('users', { users, coins_limit, coins });
    }).catch(err => console.error(err));
});

router.put('/updateFCM', authenticateToken, (req, res) => {
    const { _id } = req.user;
    const { fcm_token } = req.body;
    if (!fcm_token) return resp.error(res, 'Provide fcm token to update');

    User.findOneAndUpdate({ _id }, { fcm_token }).then(_ => resp.success(res, 'fcm token is updated.'))
        .catch(err => resp.error(res, err));
});

router.post('/sendNotification', async (req, res) => {
    const fcm = new FCM(process.env.FCM_KEY)
    const registration_ids = [];
    const ids = await User.find({}, { fcm_token: 1 });
    for (let id of ids) registration_ids.push(id);

    const message = {
        registration_ids,
        collapse_key: 'DOWNLOAD_APP',
        notification: {
            title: 'Download new version',
            body: `Please download the new version of app.`,
        },
        data: {
            title: 'Download new version',
            body: `Please download the new version of app`,
        }
    }
    return fcm.send(message, (err, response) => {
        if (err) return resp.error(res, 'Error sending notification', err);
        console.log(response);
        return res.redirect('/home');
    });
});


router.post('/set/coins/limit', (req, res) => CoinsLimit.update({ $set: { coins_limit: req.body.coins_limit } }).then(_ => res.redirect('/home')));


module.exports = router;
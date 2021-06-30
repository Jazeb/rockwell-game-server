const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const resp = require('../resp');
const User = require('../schema/user');
const CoinsLimit = require('../schema/coinsLimit');
const mailer = require('../utils/mailer');
const { generateToken, hashPwd } = require('../utils/shared');

// user signup
router.post('/signup', (req, res) => {
    const data = req.body;
    if (data.password) data.password = hashPwd(data.password);

    const code = Math.floor(Math.random() * 90000) + 10000;
    data['coins'] = 5000;

    data['auth_code'] = code;


    const user = new User(data);
    user.save((err, data) => {
        if (err) return resp.success(res, null, err.message);
        if (!data['is_admin']) {
            const email_data = { code, email: req.body.email };
            mailer.verifyAuthToken(email_data);
        }
        delete user.password;
        delete user.auth_code;
        const token = generateToken(data);
        return resp.success(res, { user, token });
    });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return resp.error(res, 'Provide email and password');

    User.findOne({ email }).then(user => {
        if (!user) return resp.error(res, 'Invalid user');
        if (!bcrypt.compareSync(password, user.password)) return resp.error(res, 'Invalid password');

        const token = generateToken(user);
        return resp.success(res, { user, token });
    }).catch(err => resp.error(res, err));
});

router.post('/verifyCode', (req, res) => {
    const { auth_code, email } = req.body;
    if (!auth_code || !email) return resp.error(res, 'Provide auth code and email');

    User.findOne({ email }).then(data => {
        if (!data) return resp.error(res, 'User does not exist')
        if (auth_code !== data.auth_code) return resp.error(res, 'Invalid code');
        if (data.is_verified) return resp.error(res, 'User is already verified');
        User.findOneAndUpdate({ email }, { is_verified: true }).then(rs => {
            return resp.success(res, 'User is verified');
        }).catch(err => resp.error(res, err));
    }).catch(err => resp.error(res, err));
});

router.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return resp.error(res, 'Provide email and password');
    const { coins_limit } = await CoinsLimit.findOne();
    User.findOne({ email, is_admin:true }).then(async user => {
        if (!user) return resp.error(res, 'Invalid user');
        if (!bcrypt.compareSync(password, user.password)) return resp.error(res, 'Invalid password');
        req.session.user = user;
        req.session.loggedin = true;

        const { coins } = await User.findOne({ _id: user._id });
        return res.render('home', { coins_limit, coins });

    }).catch(err => resp.error(res, err));
});

// admin signup
router.post('/admin/signup', (req, res) => {
    const _id = req.session.user._id;
    const data = req.body;
    if (data.password) data.password = hashPwd(data.password);

    User.findOneAndUpdate({ _id }, { $set: { email: data.email, user_name: data.user_name, password: data.password } }).then(async _ => {
        req.session.destroy();
        return res.render('login');
    });
});

router.get('/admin/signup', (req, res) => {
    res.render('signup');
});

module.exports = router;
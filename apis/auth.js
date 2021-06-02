const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const router = express.Router();

const resp = require('../resp');

const User = require('../schema/user');
const JWT_SECRET = process.env.JWT_SECRET;
const salt = bcrypt.genSaltSync(10);

const generateToken = user => jwt.sign(JSON.stringify(user), JWT_SECRET);

const hashPwd = password => bcrypt.hashSync(password, salt);

router.post('/signup', (req, res) => {
    const data = req.body;
    if (data.password) data.password = hashPwd(data.password);

    const user = new User(data);
    user.save((err, data) => {
        if (err) return resp.success(res, null, err.message);
        delete user.password
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

module.exports = router;
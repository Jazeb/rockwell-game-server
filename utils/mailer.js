require('dotenv').config();
const Mailgun = require('mailgun-js');
const User = require('../schema/user');

const num = Math.floor(Math.random() * 90000) + 10000;
const API_KEY = process.env.API_KEY;
const DOMAIN = process.env.DOMAIN;
const SENDER = process.env.SENDER;

const sendPasswordResetMail = email => {
    return new Promise((resolve, reject) => {
        const mailgun = new Mailgun({ apiKey: API_KEY, domain: DOMAIN });
        const data = {
            from: SENDER,
            to: email,
            subject: 'CryptokarBox Password Reset',
            text: `You reset password code is ${num}`,
        };
        mailgun.messages().send(data, function (err, body) {
            if (err) return reject(err);
            console.log(body);
            User.findOneAndUpdate({ email }, { $set: { reset_password_code: num } }).then(result => {
                if (!result) return resolve(false);
                return resolve(true);
            }).catch(err => reject(err));
        });
    });
}

const verifyAuthToken = data => {
    const data = {
        from: SENDER,
        to: email,
        subject: 'CryptokarBox Verify Authentication',
        text: `Thank you for registration on Eagle Network Games Apps. Please use the code ${data.code} to verify and protect your account and game points.`
    };

    return new Promise((resolve, reject) => {
        mailgun.messages().send(data, (err, result) => {
            if (err) return reject(err);
            console.log(result);
            return resolve(true);
        });
    });
}

module.exports = { sendPasswordResetMail, verifyAuthToken };
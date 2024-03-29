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
            subject: 'Eagle Network Games Password Reset',
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
    const mail_data = {
        from: SENDER,
        to: data.email,
        subject: 'Eagle Network Games Authentication',
        text: `Thank you for registration on Eagle Network Games Apps. Please use the code ${data.code} to verify and protect your account and game points.`
    };

    const mailgun = new Mailgun({ apiKey: API_KEY, domain: DOMAIN });
    return new Promise((resolve, reject) => {
        mailgun.messages().send(mail_data, (err, result) => {
            console.log(err || result);
            if (err) return reject(err);
            return resolve(true);
        });
    });
}

module.exports = { sendPasswordResetMail, verifyAuthToken };
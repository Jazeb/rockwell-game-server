require('dotenv').config();
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');

const User = require('../schema/user');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});

const sendMail = email => {
    const num = Math.floor(Math.random() * 90000) + 10000;
    const pwd = `Test_${num}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset',
        text: `Your new password is ${pwd}`
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) return reject(err)
            const salt = bcrypt.genSaltSync(10);
            const hashPwd = pwd => bcrypt.hashSync(pwd, salt);
            const new_pwd = hashPwd(pwd);
            User.findOneAndUpdate({ email }, { $set: { password: new_pwd } }).then(result => {
                if (!result) return resolve(false)
                else return resolve(true)
            }).catch(err => reject(err));
        });
    });
}

module.exports = sendMail;
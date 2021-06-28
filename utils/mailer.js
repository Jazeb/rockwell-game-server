require('dotenv').config();
// const nodemailer = require("nodemailer");
// const bcrypt = require('bcrypt');
const AWS = require('aws-sdk');
const User = require('../schema/user');

const SESConfig = {
    apiVersion: "2010-12-01",
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: "us-east-2"
}

AWS.config.update(SESConfig);
const num = Math.floor(Math.random() * 90000) + 10000;


const sendPasswordResetMail = email => {
    const params = {
        Destination: { ToAddresses: [email] },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `You reset password code is ${num}`
                },
                Text: {
                    Charset: "UTF-8",
                    Data: `You reset password code is ${num}`
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Password Reset'
            }
        },
        Source: 'cryptokarabox@gmail.com',
    };
    return new Promise((resolve, reject) => {
        const sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
        sendPromise.then(data => {
            console.log(data.MessageId);
            User.findOneAndUpdate({ email }, { $set: { reset_password_code: num } }).then(result => {
                if (!result) return resolve(false);
                return resolve(true);
            }).catch(err => reject(err));
        }).catch(err => console.error(err, err.stack));
    });
}

const verifyAuthToken = data => {
    const params = {
        Destination: { ToAddresses: [data.email] },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `Thank you for registration on Eagle Network Games Apps. Please use the code ${data.code} to verify and protect your account and game points.`
                },
                Text: {
                    Charset: "UTF-8",
                    Data: `Thank you for registration on Eagle Network Games Apps. Please use the code ${data.code} to verify and protect your account and game points.`
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Password Reset'
            }
        },
        Source: 'cryptokarabox@gmail.com',
    };
    return new Promise((resolve, reject) => {
        const sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
        sendPromise.then(data => {
            console.log(data.MessageId);
            return resolve(true);
        }).catch(err => reject(err.stack));
    });
}

/*const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});*/


/*const sendMail = email => {
    const num = Math.floor(Math.random() * 90000) + 10000;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset',
        text: `You reset password code is ${num}`
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) return reject(err);
            User.findOneAndUpdate({ email }, { $set: { reset_password_code: new_pwd } }).then(result => {
                if (!result) return resolve(false);
                return resolve(true);
            }).catch(err => reject(err));
        });
    });
}*/

/*const verifyAuthToken = data => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: data.email,
        subject: 'Verify Email',
        text: `Thank you for registering for our cool fun Games. Please use the code ${data.code} to verify your identity`
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) return reject(err);
            return resolve(true)
        });
    });
}*/



module.exports = { sendPasswordResetMail, verifyAuthToken };
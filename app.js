const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const auth = require('./apis/auth');
const userCtrl = require('./apis/userCtrl');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', auth);
app.use('/user', userCtrl);

app.get("/", (req, res) => res.status(200).json({ status: true, result: 'server is running' }));
app.all("*", (req, res) => res.status(404).json({ error: true, message: 'invalid url' }));

module.exports = app;
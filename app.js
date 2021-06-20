const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const app = express();

const auth = require('./apis/authCtrl');
const userCtrl = require('./apis/userCtrl');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use('/auth', auth);
app.use('/user', userCtrl);
app.use('/home', userCtrl);

app.get("/", (req, res) => res.status(200).json({ status: true, result: 'server is running' }));
app.all("*", (req, res) => res.status(404).json({ error: true, message: 'invalid url' }));

module.exports = app;
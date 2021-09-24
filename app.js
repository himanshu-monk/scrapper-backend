var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const mongoose = require("mongoose");

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/downloads", express.static(path.join(__dirname, 'downloads')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const DB_URL = "mongodb+srv://root:toor@cluster0.6ija7.mongodb.net/scrapper?retryWrites=true&w=majority"

mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: true })
  .then(() => console.log("DB connection established"))
  .catch(error => console.log(error))
module.exports = app;
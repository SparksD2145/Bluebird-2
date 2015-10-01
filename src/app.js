/**
 * @file Application master file, contains primary aspects of launching RSSNavigator Webservice. Based on Express/Node boilerplate.
 * @author Thomas Ibarra <sparksd2145.dev@gmail.com>
 * @requires module:express
 * @requires module:path
 * @requires module:bower
 * @requires module:serve-favicon
 * @requires module:morgan
 * @requires module:less-middleware
 * @requires module:Configuration
 * @requires module:RouteController
 * @exports Bluebird
 */

var favicon = require('serve-favicon');
var logger = require('morgan');
var path = require('path');
var bodyParser = require('body-parser');
var express = require('express');
var less = require('less-middleware');
var compression = require('compression');
var app = express();

// Load Configuration
var config = require('./config')(process.env.NODE_ENV);
app.set('config', config);

// Load debugger
app.set('debug', require('./debugger'));

// view engine setup
app.set('views', path.join(__dirname, ''));
app.set('view engine', 'jade');

// Use less engine
app.use(less(__dirname + '/public', {
    force: config.less.force,
    once: config.less.once
}));

// Connect to the database.
var dbAddress = app.get('config').database.address;
var mongoose = require('mongoose');
var db;

if (app.get('config').database.active) {
    var db = mongoose.connect(dbAddress);
    app.set('db', db);
}

app.use(favicon(__dirname + '/public/static/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Mount directory "/public" as public facing directory "/"
app.use(express.static(path.join(__dirname, 'public'), {maxAge: '3d'}));

// Mount directory "/bower_components" as public facing directory "/libraries"
app.use('/libraries', express.static(path.join(__dirname, '../bower_components'), {maxAge: '3d'}));

// Mount directory "/depends" as public facing directory "/extras"
app.use('/extras', express.static(path.join(__dirname, '../depends'), {maxAge: '3d'}));

// Enable RouteController to handle application routes
var routeController = require('./controllers/RouteController');
app.use(new routeController((app)));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (config.application.developmentMode) {
    app.use(function(err, req, res) {
        //res.status(err.status || 500);
        res.render('views/error', {
            message: err.message,
            error: err
        });
    });
} else {
    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res) {
        //res.status(err.status || 500);
        res.render('views/error', {
            message: err.message,
            error: {}
        });
    });
    app.use(compression());
}

module.exports = app;

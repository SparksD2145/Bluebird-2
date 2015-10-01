#!/usr/bin/env node

/** @file Bluebird initialization script. */

/** Initialize Debugger and load Bluebird. */
var debug = require('debug')('Bluebird');

// Provide Run function for application start
var run = function(app) {
    /** Set the server port of Bluebird. */
    app.set('port', process.env.PORT || 80);

    /** Start Bluebird's Express server */
    var server = app.listen(app.get('port'), function() {
        debug('Bluebird express server listening on port ' + server.address().port);
    });
};

var environment = process.env.node_env; // jscs:ignore requireCamelCaseOrUpperCaseIdentifiers

// Load application based on environment, assume production unless development
if (environment !== 'development') {
    var app = require('./build/app');
    run(app);
} else {
    var app = require('./src/app');
    run(app);
}
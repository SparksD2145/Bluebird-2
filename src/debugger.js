/** @file Common use error handler generation script */

function ErrorHandler(name) {
    var debug = require('debug');
    this.debugger = debug;

    /**
     * Log information to the console.
     * @method
     */
    this.log = debug(name + ':log');

    /**
     * Log an error to the console.
     * @method
     */
    this.error = debug(name + ':error');
    this.error.log = console.error.bind(console);
}

module.exports = ErrorHandler;

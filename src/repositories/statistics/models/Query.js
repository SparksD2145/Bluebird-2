/**
 * @file Query model, used in statistics.
 * @author Thomas Ibarra <sparksd2145.dev@gmail.com>
 */

// Load non-mongoose Dependencies
var debug = require('./../../../debugger')('QueryModel');
var moment = require('moment');

// Require mongoose, and Schema too for ease of access.
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Query schema template
var queryTemplate = {
    date: Date,
    query: String,
    origin: String,
    route: Object,
    params: Array
};

// Create the Schema from its template
var querySchema = new Schema(queryTemplate, {
    autoIndex: false,
    collection: 'queries'
});

/**
 * Sets the query's date property as the current time.
 * @returns {Object} Returns this for chaining.
 */
querySchema.methods.now = function(){
    this.date = moment().toDate();
    return this;
};

/**
 * Sets the date of the Query object manually.
 * @param {Date} date A date to set to.
 * @returns {*} Returns this for chaining.
 */
querySchema.methods.setDate = function(date){
    if(!date) {
        debug.error('QueryModel.setDate was not passed a required Date parameter.');
        return false;
    } else if (!(date instanceof Date)){
        debug.error('QueryModel.setDate was passed a parameter, but the parameter was not a Date.');
        return false;
    }

    this.date = date;
    return this;
};

var Query = mongoose.model('Query', querySchema);

module.exports = Query;
/**
 * @file Statistics Repository
 * @author Thomas Ibarra <sparksd2145.dev@gmail.com>
 */
var moment = require('moment');
var Query = require('./models/Query');

/**
 * Handles statistics for application.
 * @param app
 * @constructor
 */
function StatisticsRepository(app) {
    this.app = app;
}

/**
 * Add a client query to the database.
 * @param queryString Client's string query, in original form.
 * @param request The request object retrieved from express.
 */
StatisticsRepository.prototype.addQuery = function(queryString, request) {
    var query = new Query({
        origin: request.ip,
        params: request.params,
        route: request.route,
        query: queryString,
        date: moment().toDate()
    });

    query.save(function(err) {
        if (err instanceof Error) {
            console.error(err);
            return false;
        }
        return true;
    });
};

/*
 * Retrieve all queries in database
 * @param next Callback function
 */
StatisticsRepository.prototype.getAllQueries = function(next) {
    Query
        .aggregate()
        .project({_id: 0, query: 1})
        .exec(next);
};

module.exports = StatisticsRepository;

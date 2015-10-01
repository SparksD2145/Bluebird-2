/**
 * @file RouteController controller.
 * @author Thomas Ibarra <sparksd2145.dev@gmail.com>
 * @exports RouteController
 */

/**
 * Handles URL addressing and processing via an Express.Router instance.
 * @class
 * @module RouteController
 * @requires module:express
 * @requires module:lodash
 * @requires module:debug
 * @requires module:ProductRepository
 * @returns {RouteController}
 */
function RouteController(app) {

    /** Initialize instance of Express.Router for routing operations */
    var router = require('express').Router();
    var _ = require('lodash');

    // Initialize an instance of the debugger
    var debug = new (app.get('debug'))('RouteController');

    // Let developers know an instance of the controller is being created.
    debug.log('Initializing an instance of RouteController.');

    /** Require ProductRepository for product operations */
    var ProductRepository = require('../repositories/product/productRepository');
    ProductRepository = new ProductRepository(app);

    /** Require StatisticsRepository for application statistics operations */
    var StatisticsRepository = require('../repositories/statistics/statisticsRepository');
    StatisticsRepository = new StatisticsRepository(app);

    /** Registers URL Route Parameters with Application */
    (function DefineRouteParameters() {
        debug.log('Defining Route Parameters.');

        /** Define 'type' routing parameter and pass to request */
        router.param('resource', function(req, res, next, resource) {
            if (!_.isEmpty(resource) && _.isString(resource)) req.resource = resource;
            next();
        });

        /** Define 'type' routing parameter and pass to request */
        router.param('subresource', function(req, res, next, subresource) {
            if (!_.isEmpty(subresource) && _.isString(subresource)) req.subresource = subresource;
            next();
        });

        /** Define 'query' routing parameter and pass to request */
        router.param('query', function(req, res, next, query) {
            if (!_.isEmpty(query) && _.isString(query)) req.id = query;
            next();
        });
    })();

    /** Registers API Routes with Application */
    (function DefineAPIRoutes() {

        /** Send the client a successful response with JSON data */
        function Success() {
            var successTemplate = function(status, response, result, callback) {
                response
                    .status(status)
                    .json(result);

                if (_.isFunction(callback)) return callback();
            };

            return {
                withData: _.partial(successTemplate, 200),
                withoutData: _.partial(successTemplate, 204)
            };
        }

        /** Send the client a failure response indicating a Bad Request */
        function Failure() {
            var failureTemplate = function(status, response, errorDetails, callback) {
                response
                    .status(status)
                    .send({error: errorDetails})
                    .end();

                if (_.isFunction(callback)) return callback();
            };

            return {
                badRequest: _.partial(failureTemplate, 400),
                unauthorized: _.partial(failureTemplate, 401),
                forbidden: _.partial(failureTemplate, 403),
                notFound: _.partial(failureTemplate, 404),
                methodNotAllowed: _.partial(failureTemplate, 405),
                serverFailure: _.partial(failureTemplate, 500)
            };
        }

        /* API ROUTES */

        /* GET /api/:resource */
        router.get('/api/:resource', function(req, res) {

            if (_.isEmpty(req.params) || _.isEmpty(req.params.resource))
                new Failure()
                    .serverFailure(res, 'A resource to retrieve was not provided.');

            /** Product API */
            if (req.params.resource.toLowerCase() == 'product') {

                // Extended search can quickly drain our query limit, setting it to false by default prevents this.
                var useExtendedSearch = 'false';
                var condensed = 'false';

                // Check client's request to see if extendedSearch is true and cast it as a boolean.
                if (!_.isEmpty(req.query) && !_.isEmpty(req.query.extendedSearch))
                    useExtendedSearch = req.query.extendedSearch === 'true';

                // Check client's request to see if condensed is true and cast it as a boolean.
                if (!_.isEmpty(req.query) && !_.isEmpty(req.query.condensed))
                    condensed = req.query.condensed === 'true';

                // If the request doesn't include a query, fail the request.
                if (_.isEmpty(req.query) || !req.query.query) {
                    new Failure()
                        .badRequest(res, 'No query parameter provided, API call will abort.');

                    debug.log('Client did not provide a Query to search for; API call aborted.');

                    return false;
                }

                // Perform a product query
                ProductRepository.query(req.query.query.toLowerCase(), useExtendedSearch, condensed, function(result) {
                    if (result instanceof Error) {
                        debug.error(result);

                        new Failure()
                            .serverFailure(res, 'The server encountered an error while processing the request.');

                        return false;

                    } else {
                        // Add query to database
                        StatisticsRepository.addQuery(req.query.query, req);

                        if (!_.isEmpty(result)) {
                            return new Success()
                                .withData(res, result);
                        } else {
                            return new Success()
                                .withoutData(res, result);
                        }

                    }
                });
            }

            /* GET /api/availability?query&location=&distance= */
            if (req.params.resource.toLowerCase() == 'availability') {

                // If the request doesn't include a query, fail the request.
                if (_.isEmpty(req.query) || !req.query.query) {
                    new Failure()
                        .badRequest(res, 'No query parameter provided, API call will abort.');

                    return false;
                }

                if (typeof req.query.location === 'undefined') {
                    new Failure()
                        .badRequest(res, 'No location parameter provided, API call will abort.');

                    return false;
                }

                // Default to 25 miles if no distance preference was provided.
                if (!_.isEmpty(req.query) && !req.query.distance) {
                    req.query.distance = 25; // default distance (miles) setting
                }

                ProductRepository.runBBYProductAvailabilityQuery(
                    req.query.query.toLowerCase(),
                    req.query.location,
                    req.query.distance,
                    function(result) {
                        if (result instanceof Error) {
                            debug.error(result);

                            new Failure()
                                .serverFailure(res, 'The server encountered an error while processing the request.');

                            return false;

                        } else {
                            return new Success()
                                .withData(res, result);
                        }
                    }
                );
            }
        });

        /* GET /api/:resource */
        router.get('/api/:resource/:subresource', function(req, res) {
            var sendGeneralFailure = function() {
                res.status(500).send({error: 'Something isn\'t right here.'}).end();
                return false;
            };

            if (_.isEmpty(req.params) || _.isEmpty(req.params.resource)) sendGeneralFailure();
            if (_.isEmpty(req.params) || _.isEmpty(req.params.subresource)) sendGeneralFailure();

            /** Statistics API */

            /* GET /api/stats */
            if (req.params.resource.toLowerCase() == 'statistics') {
                if (req.params.subresource.toLowerCase() == 'getallqueries') {
                    StatisticsRepository.getAllQueries(function(err, result) {

                        result = _.countBy(result, function(r) { return r.query; });

                        var response = {
                            size: _.size(result),
                            result: result
                        };
                        res.json(response);
                    });
                }
            }
        });
    })();

    /** Registers URL Routes with Application */
    (function DefineRoutes() {

        debug.log('Defining Routes.');

        /* GET /:state/*name */
        /** Retrieve individual states */
        router.get('/state/*', function(req, res) {
            /** Work from the states directory */
            var pageStorageUrlPrefix = 'public/states/';

            /** If no state parameter was passed, return a 404 error */
            if (typeof req.params[0] === 'undefined') {
                var err = new Error('Not Found');
                err.status = 404;
                next(err);
                return false;
            }

            /** Get the state and render */
            var state = pageStorageUrlPrefix + req.params[0];

            res.render(state, {
                /** Provide all JADE states a devMode attribute to indicate if in development mode. */
                devMode: app.get('config').application.developmentMode,
                usingDatabase: app.get('config').database.active
            });
        });

        /* Master Route (used for html5 addressing */
        /* ALL / */
        router.all('/*', function(req, res) {
            res.render('views/master', {
                title: app.get('config').application.name,
                devMode: app.get('config').application.developmentMode
            });
        });
    })();

    return router;
}
module.exports = RouteController;

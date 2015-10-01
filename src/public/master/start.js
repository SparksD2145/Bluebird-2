/**
 * @file Master initialization file for Bluebird. Begins initialization of program.
 * @author Thomas Ibarra <sparksd2145.dev@gmail.com>
 */

/**
 * Global namespace for Bluebird application.
 * @namespace
 * @global
 */
var Bluebird = {};

/** Initialization of application */
(function initialize() {

    // Enumerate internal namespaces.
    var namespaces = {
        /**
         * Raw core, non-angular components of the application.
         * @namespace
         */
        Components: {},
        /**
         * Core AngularJS Controllers of the application.
         * @namespace
         */
        Controllers: {},
        /**
         * Core AngularJS Directives of the application.
         * @namespace
         */
        Directives: {},
        /**
         * Pages of the application.
         * @namespace
         */
        States: {},
        /**
         * Core AngularJS Services of the application.
         * @namespace
         */
        Services: {},
        /**
         * Storage for Dependencies
         * @namespace Bluebird.Dependencies
         */
        Dependencies: []
    };

    // Add non-angular dependencies to temporary structure.
    namespaces.Dependencies.push(
        new Dependency('lodash', '_', window._),
        new Dependency('momentJs', 'moment', window.moment)
    );

    // Merge all prior constructs to form finalized object.
    Bluebird = _.extend(
        Bluebird,
        namespaces,
        angular.module('Bluebird', [
            'ngRoute', 'ngSanitize', 'ngAnimate', 'ngResource', 'ngMaterial', // Core angular libraries.
            'geolocation', 'monospaced.qrcode', 'ngStorage', // Third-party angular libraries.
            'lodash', 'momentJs' // Third-party libraries.
        ])
    );

    /**
     * Utilize passed functions as arguments for Bluebird.config() method.
     * @type {Array}
     */
})();

/**
 * Dependency class
 * @class
 * @param name
 * @param ref
 * @param obj
 * @constructor
 */
function Dependency(name, ref, obj) {
    if (!name || !ref || !obj) throw new Error('Could not create Dependency: required parameter missing.');
    if (name && typeof name != 'string') throw new Error('Could not create Dependency: invalid name specified.');
    if (ref && typeof ref != 'string') throw new Error('Could not create Dependency: invalid reference specified.');

    this.name = name;
    this.reference = ref;
    this['calls'] = obj;

    var internalObj = angular.module(name, []);
    internalObj.factory(ref, function() {
        return obj;
    });
}

/**
 * Application-wide configuration for routing based functionality.
 */
Bluebird.config([
    '$locationProvider', '$routeProvider', '$mdThemingProvider',
    'Bluebird.StatesProvider',
    function($locationProvider, $router, $mdThemingProvider, statesCollection) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('light-blue')
            .warnPalette('amber');

        // Compile states and gather collection.
        var states = statesCollection.compile().getCollection();

        // Load states into state provider for addressing.
        _.each(states, function(state) {

            if (_.isArray(state.url)) {
                _.each(state.url, function(url) {
                    $router.when(url, state);
                });
            } else {
                $router.when(state.url, state);
            }

            $router.otherwise('/');
        });

        // Use Html5 mode, but use crunch-bang (#!) as routing for non-html5 compliant browsers.
        $locationProvider
            .html5Mode(true)
            .hashPrefix('!');
    }
]);

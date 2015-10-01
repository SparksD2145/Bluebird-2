/** @file Application Configuration file */

var _ = require('lodash');
var env = loadEnvironmentVariables();

var environments = {};
environments['development'] = {
    application: {
        name: 'Bluebird',
        developmentMode: true
    },
    database: {
        address: env.DB_ADDRESS,
        active: false
    },
    bbyOpen: {
        address: 'http://api.remix.bestbuy.com/v1/',
        key: env.BBY_API_KEY,
        active: true
    },
    less: {
        force: false,
        once: false
    }

};
environments['production'] = {
    application: {
        name: 'Bluebird',
        developmentMode: false
    },
    database: {
        address: env.DB_ADDRESS,
        active: false
    },
    bbyOpen: {
        address: 'http://api.remix.bestbuy.com/v1/',
        key: env.BBY_API_KEY,
        active: true
    },
    less: {
        force: false,
        once: true
    }
};
environments['default'] = environments.production;

function retrieveConfiguration(environment) {
    if (!environment) return environments.default;

    return environments[environment];
}

/**
 * Loads environment variables used to configure application.
 * @returns Object
 */
function loadEnvironmentVariables() {
    var environmentVariables = [
        {'BBY_API_KEY': {required: true}},
        {'DB_ADDRESS': {required: true}}
    ];

    var loadedVariables = {};
    _.each(environmentVariables, function(variable) {
        var variable = new EnvironmentVariable(variable);
        loadedVariables[variable.name] = variable.value;
    });

    return loadedVariables;
}

/**
 * Environment Variable Container
 * @param config Variable Configuration
 * @constructor
 */
function EnvironmentVariable(config) {
    this.name = _.first(_.keys(config));
    this.required = typeof config.required !== 'undefined' ? config.required : false;
    this.defaultValue = typeof config.defaultValue !== 'undefined' ? config.defaultValue : false;

    // Reject if required and unavailable.
    if (this.required && typeof process.env[this.name] === 'undefined') {
        throw new ReferenceError('Environment variable "' + this.name + '" is not set.');
    }

    if (typeof process.env[this.name] !== 'undefined') {
        this.value = process.env[this.name];
    } else {
        this.value = this.defaultValue;
    }
}

module.exports = retrieveConfiguration;

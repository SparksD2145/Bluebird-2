/**
 * @file Bluebird.States Collection (Provider)
 * @author Thomas Ibarra <sparksd2145.dev@gmail.com>
 */

/**
 * Provides a collection of states retrieved from Bluebird.States namespace for use in client-side route configuration.
 */
Bluebird.provider('Bluebird.States', function StatesCollectionProvider() {
    /**
     * Require the Bluebird.States namespace. If it isn't present, the application cannot load.
     * @throws ReferenceError Signifies a missing but required Bluebird.States namespace. This namespace is used to store raw state components.
     */
    if (typeof Bluebird.States === 'undefined') console.error(new ReferenceError('Bluebird.States collection is missing.'));

    /**
     * Storage for states.
     * @type {Array}
     * @private
     */
    var statesCollection = [];

    /**
     * Generates fully-qualified State objects.
     * @param config A state component's configuration object.
     * @constructor
     */
    function State(config) {
        /**
         * State template.
         * @mixin
         */
        var configTemplate = {
            name: undefined,
            template: undefined,
            templateUrl: undefined,
            templateProvider: undefined,
            controller: undefined,
            controllerAs: undefined,
            resolve: undefined,
            url: undefined,
            reloadOnSearch: undefined,
            redirectTo: undefined,
            caseInsensitiveMatch: undefined
        };

        /**
         * Generate a State based on template and passed configuration.
         * @mixes configTemplate
         * @returns State
         */
        _.extend(this, configTemplate, config);
    }

    /**
     * Compiles all raw States into qualified States and loads them into the collection. Returns this for chaining.
     * @method
     * @returns {StatesCollectionProvider}
     */
    this.compile = function() {
        // Empty States Collection.
        statesCollection = [];

        _.each(Bluebird.States, function(stateObj) {
            var state = new State(stateObj);

            state.templateUrl = _.isString(state.templateUrl) ?
            'state/' + state.templateUrl :
            state.templateUrl;

            statesCollection.push(state);
        }, this);

        return this;
    };

    /**
     * Retrieves the internal StateCollection.
     * @method
     * @returns {States[]}
     */
    this.getCollection = function() { return statesCollection; };

    /**
     * Provider $get method, returns a buildable StatesCollectionProvider for angular configuration.
     * @method
     * @returns {StatesCollectionProvider}
     */
    this.$get = function() {
        return this;
    };
});

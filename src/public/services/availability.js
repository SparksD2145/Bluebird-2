/**
 * @file Product Availability service source file.
 * @author Thomas Ibarra <sparksd2145.dev@gmail.com>
 */

/**
 * Retrieves product availability from stores nearby.
 * @requires module:ngResource
 * @requires module:geolocation
 * @requires module:lodash
 */
Bluebird.service('Bluebird.Services.Availability', [
    '$resource', 'geolocation',
    '_',
    function ProductCollection($resource, geolocation, _){
        /**
         * Internal storage for products within the collection.
         * @type {Array}
         * @internal
         */
        var storesStored = [];

        /** Products API */
        var api = $resource('/api/availability');

        /**
         * Add a store to the collection
         * @param store A store to add to the collection.
         * @returns {*}
         */
        this.add = function(store){
            // Didn't pass one? Don't add one.
            if(_.isUndefined(store)) return false;

            // If the developer passes an Array of Products, handle gracefully.
            if(_.isArray(store)){
                // Add only products that have not been added prior
                return storesStored = _.union(storesStored, store);
            } else {
                storesStored.save(store);
                return storesStored;
            }
        };

        /**
         * Remove a store from the collection
         * @param store A store to add to the collection.
         * @returns {*}
         */
        this.remove = function(store){
            // Didn't pass one? Don't add one.
            if(_.isUndefined(store)) return false;

            var deleteSingle = function(singleProduct) {

                // If the developer passes a Number, assume it represents the _id of the Product.
                // Otherwise, treat as a Product instance.
                if (_.isNumber(singleProduct)) {

                    return storesStored = _.without(storesStored, _.findWhere(storesStored, { _id: store }));

                } else {
                    if (_.isUndefined(singleProduct._id)) return false;
                    return storesStored = _.without(storesStored, singleProduct);
                }
            };

            if(_.isArray(store)){ return storesStored = _.difference(storesStored, store); }
            else { return deleteSingle(store); }
        };

        /**
         * Finds a product within the collection.
         * @param product A product to search for.
         * @returns {*}
         */
        this.find = function(product){
            // Didn't pass one? Don't add one.
            if(_.isUndefined(product)) return null;

            // If the developer passes a Number, assume it represents the _id of the Product.
            // Otherwise, treat as an object instance we can search with.
            if (_.isNumber(product)) {
                return _.findWhere(storesStored, { storeId: product });

            } else {
                if (!_.isObject(product)) return false;
                return _.where(storesStored, product);
            }
        };

        this.query = function(query, callback) {
            var internalCallback = function(result) {
                // this.add(result); // @todo add caching to availability
                return callback(result);
            }.bind(this);


            geolocation.getLocation()
                .then(function (geoposition) {
                    var location = geoposition.coords.latitude + ',' + geoposition.coords.longitude;

                    var args = [
                        {
                            query: query,
                            location: location
                        }, function (products) {
                            internalCallback(products);
                        }
                    ];
                    api.query.apply(this, args);
                })
                .catch(function(errMsg){
                    // Could not retrieve geolocation data.
                    callback(new Error(errMsg));
                });
        };

        this.queryByZip = function(query, zipcode, radius, callback) {
            var internalCallback = function(result) {
                // this.add(result); // @todo add caching to availability
                return callback(result);
            }.bind(this);

            if(typeof zipcode == 'undefined'){ return false; }

            // Default to 25 miles if radius is not specified
            if(!radius) radius = 25;

            var args = [
                {
                    query: query,
                    location: zipcode,
                    distance: radius
                }, function (products) {
                    internalCallback(products);
                }
            ];
            api.query.apply(this, args);
        };

        this.canQuery = function(){
            return window.navigator.geolocation;
        }
    }
]);
/**
 * @file Products Collection source file.
 * @author Thomas Ibarra <sparksd2145.dev@gmail.com>
 */

Bluebird.service('Bluebird.Services.Products', [
    '$resource',
    '$localStorage', '_',
    function ProductCollection($resource, $storage, _){
        /**
         * Internal storage for products within the collection.
         * @type {Array}
         * @internal
         */
        var productsStored = [];

        /** Internal storage under local storage */
        $storage.products = {};
        $storage.queries = {};

        /** Products API */
        var api = $resource('/api/product');

        /**
         *
         * @param product A product to add to the collection.
         * @returns {*}
         */
        this.add = function(product){
            // Didn't pass one? Don't add one.
            if(_.isUndefined(product)) return false;

            // If the developer passes an Array of Products, handle gracefully.
            if(_.isArray(product)){
                // Add only products that have not been added prior
                return productsStored = _.union(productsStored, product);
            } else {
                productsStored.push(product);
                return productsStored;
            }
        };

        this.remove = function(product){
            // Didn't pass one? Don't add one.
            if(_.isUndefined(product)) return false;

            var deleteSingle = function(singleProduct) {

                // If the developer passes a Number, assume it represents the _id of the Product.
                // Otherwise, treat as a Product instance.
                if (_.isNumber(singleProduct)) {

                    return productsStored = _.without(productsStored, _.findWhere(productsStored, { _id: product }));

                } else {
                    if (_.isUndefined(singleProduct._id)) return false;
                    return productsStored = _.without(productsStored, singleProduct);
                }
            };

            if(_.isArray(product)){ return productsStored = _.difference(productsStored, product); }
            else { return deleteSingle(product); }
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
                return _.findWhere(productsStored, { _id: product });

            } else {
                if (!_.isObject(product)) return false;
                return _.where(productsStored, product);
            }
        };

        /**
         * Retrieves a detailed product result from the search service.
         * @param query A product to search for.
         * @param extendedSearch Perform an extended BBYOPEN Search
         * @param callback A callback function to execute upon completion
         * @returns {*}
         */
        this.query = function(query, extendedSearch, callback) {
            var internalCallback = function(result) {

                // Add to local storage
                if($storage.products){
                    $storage.products[query] = result;
                }

                this.add(result);
                return callback(result);
            }.bind(this);

            // Arguments to pass to query function
            var args = [
                {
                    query: query,
                    extendedSearch: extendedSearch,
                    condensed: false
                }, function(products){

                    internalCallback(products);
                }
            ];

            if($storage.products){
                if(!extendedSearch && _.has(_.keys($storage.products), query)){
                    internalCallback($storage.products[query]);
                } else {
                    if($storage.products[query]) delete $storage.products[query];
                    api.query.apply(this, args);
                }
            } else {
                api.query.apply(this, args);
            }


        };

        /**
         * Retrieves a condensed product result from the search service.
         * @param query A product to search for.
         * @param extendedSearch Perform an extended BBYOPEN Search
         * @param callback A callback function to execute upon completion
         * @returns {*}
         */
        this.search = function(query, extendedSearch, callback){
            var internalCallback = function(result) {

                // Add to local storage
                if($storage.queries){
                    $storage.queries[query.toString()] = result;
                }

                return callback(result);
            }.bind(this);

            var args = [
                {
                    query: query,
                    extendedSearch: extendedSearch,
                    condensed: true
                }, function(products){
                    internalCallback(products);
                }
            ];

            if($storage.queries){
                if(!extendedSearch && _.has(_.keys($storage.queries), query)){
                    internalCallback($storage.queries[query]);
                } else {
                    if($storage.queries[query]) delete $storage.queries[query];
                    api.query.apply(this, args);
                }
            } else {
                api.query.apply(this, args);
            }
        };
    }
]);
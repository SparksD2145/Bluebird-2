/**
 * @file Search Page
 * @author Thomas Ibarra <sparksd2145.dev@gmail.com>
 */
Bluebird.States['Search'] = {
    name: 'search',
    url: '/search/:query',

    controller: [
        '$scope', '$routeParams', '$rootScope',
        '_',
        'Bluebird.Services.Products',
        function($scope, $routeParams, $rootScope, _, products){
            $scope.isLoaded = false;
            $scope.extendedSearch = false;
            $scope.noMatch = false;
            $scope.results = [];


            $scope.query = function() {
                $scope.productSelected = null;

                if(_.isEmpty($routeParams.query)) console.error(new Error('Oops, there\'s nothing to search for!'));

                products.search($routeParams.query, $scope.extendedSearch, function(results){

                    if(!_.isEmpty(results)){
                        $scope.isLoaded = true;
                        $scope.results = results;
                        $scope.products = results;
                    } else {
                        if(!$scope.extendedSearch){
                            $scope.useExtendedSearch();
                        } else {
                            $scope.noMatch = true;
                        }
                    }

                });
            };

            $scope.useExtendedSearch = function(){
                $scope.isLoaded = false;
                $scope.extendedSearch = true;

                $scope.query();
            };

            $scope.changeProduct = function(id){
                $scope.productSelected = products.find({ _id: id });
            };

            // Run search query
            $scope.query();

            (function setUpFilters(){

                // Filter Method
                $scope.filter = function(){
                    if(_.some($scope.filterOptions, function(filter) { return filter.active; })){
                        $scope.products = _.filter($scope.results, function(result){
                            var pass = [];

                            if($scope.filterOptions.online.active){
                                pass.push(!result.availability.hasInStoreAvailability);
                            }

                            if($scope.filterOptions.inStore.active){
                                pass.push(result.availability.hasInStoreAvailability);
                            }

                            if($scope.filterOptions.onSale.active) {
                                pass.push(result.pricing.isOnSale);
                            }

                            if($scope.filterOptions.hasFreeShipping.active) {
                                pass.push(result.availability.hasFreeShipping);
                            }

                            return _.all(pass);
                        });
                    } else {
                        $scope.products = [].concat($scope.results);
                    }
                };

                // Set up Buttons
                function Button(data){
                    this.text = data.text;
                    this.active = data.active;
                    this.filter = $scope.filter;
                }

                // Filters usable
                $scope.filterOptions = {
                    inStore: new Button({
                        text: 'In Store Only',
                        active: false
                    }),
                    online: new Button({
                        text: 'Online Only',
                        active: false
                    }),
                    onSale: new Button({
                        text: 'On Sale',
                        active: false
                    }),
                    hasFreeShipping: new Button({
                        text: 'Free Shipping',
                        active: false
                    })
                };

                // Link buttons to their appropriate keys
                _.each($scope.filterOptions, function(button, key){
                    button.key = key;
                });
            })();

            (function setUpSorts(){
                // Sort Method
                $scope.sort = function(key){
                    if(key === 'defaultOrder'){
                        $scope.products = [].concat($scope.results);
                    } else {
                        var tokens = key.split('.');
                        $scope.products = _.sortBy($scope.results, function(product){
                            return product[tokens[0]][tokens[1]];
                        });
                    }
                };

                // Set up Buttons
                function Button(data){
                    this.text = data.text;
                    this.active = data.active;
                    this.sort = $scope.sort;
                }

                // Sorts usable
                $scope.sortOptions = {
                    defaultOrder: new Button({
                        text: 'Default Order'
                    }),
                    'identifiers.sku': new Button({
                        text: 'By Sku'
                    }),
                    'pricing.regularPrice': new Button({
                        text: 'By Regular Price'
                    })
                };

                // Link buttons to their appropriate keys
                _.each($scope.sortOptions, function(button, key){
                    button.key = key;
                });
            })();

        }
    ],
    templateUrl: 'search/search'
};
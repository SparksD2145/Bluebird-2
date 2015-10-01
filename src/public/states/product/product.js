/**
 * @file Product Page
 * @author Thomas Ibarra <sparksd2145.dev@gmail.com>
 */

Bluebird.States['Product'] = {
    name: 'product',
    controller: [
        '$scope', '$routeParams', '$resource',
        '_',
        'Bluebird.Services.Products', 'Bluebird.Services.Availability',
        function($scope, $routeParams, $resource, _, Products, Availability){

            $scope.radius = '25';

            $scope.showAvailability = function(){
                $scope.availabilityLoaded = true;
            };
            $scope.showGeolocationError = function(){
                $scope.geolocationUnavailable = true;
            };
            $scope.showProductNotFoundError = function(){
                $scope.productNotFound = true;
            };

            $scope.getAvailabilityByZipCode = function(){
                $scope.getAvailability(
                    $scope.product,
                    true,
                    angular.element('#zipcodeText').val(),
                    angular.element('#radiusValue').val()
                );
            };

            $scope.getAvailability = function(product, byZipCode, zipcode, radius){
                if(!product) product = $scope.product;
                if(!zipcode) zipcode = $scope.zipcode;
                if(!radius) radius = $scope.radius;

                $scope.availabilityLoaded = false;

                // Get product availability if it's available in stores.
                if(product.availability.hasInStoreAvailability){

                    $scope.allowAlternateAreaSearch = true;

                    if(!byZipCode){
                        if(Availability.canQuery()) {
                            Availability.query(product.identifiers.sku, function (stores) {

                                if (stores instanceof Error) {
                                    // Geolocation service could not be utilized
                                    $scope.showGeolocationError();
                                }

                                product.stores = stores;
                                product.availability.anyStores = !_.isEmpty(product.stores);

                                $scope.showAvailability();

                                return product;
                            });
                        } else {
                            $scope.showGeolocationError();
                            $scope.showAvailability();
                        }
                    } else {
                        Availability.queryByZip(product.identifiers.sku, zipcode, radius, function (stores) {

                            product.stores = stores;
                            product.availability.anyStores = !_.isEmpty(product.stores);

                            $scope.showAvailability();

                            return product;
                        });
                    }

                } else {
                    product.availability.anyStores = false;
                    $scope.showAvailability();
                    return product;
                }
            };

            // Rebuild product information to better display information to user
            var rebuildProduct = function(product){
                // Unescape the long description returned by the server.
                if (product.descriptions) {
                    product.descriptions.longDescription = _.unescape(product.descriptions.longDescription);
                }

                // Calibrate savings value to a no-decimal value.
                if (product.savings.percentSavings) {
                    product.savings.percentSavings = parseFloat(product.savings.percentSavings).toFixed(0);
                }

                // Format the product's release date, if available.
                if (product.availability.releaseDate) {
                    product.availability.releaseDate = moment(product.availability.releaseDate).calendar();

                    var invalidDateRegex = /invalid date.?/i;
                    product.availability.releaseDateValid = !invalidDateRegex.test(product.availability.releaseDate);
                }

                // Make review average useful and generate stars.
                if(product.reviews.customerReviewAverage) {
                    var size = Math.ceil(parseFloat(product.reviews.customerReviewAverage));

                    // Create stars
                    var stars = [];
                    for(var i = 1; i < size + 1; i++) {
                        stars.push(i);
                    }
                    product.reviews.reviewStars = stars;

                    // Create adjective
                    switch(size){
                        case 0:
                            product.reviews.adjective = 'quietly';
                            break;
                        case 1:
                            product.reviews.adjective = 'very poorly';
                            break;
                        case 2:
                            product.reviews.adjective = 'poorly';
                            break;
                        case 3:
                            product.reviews.adjective = 'adequately';
                            break;
                        case 4:
                            product.reviews.adjective = 'well';
                            break;
                        case 5:
                            product.reviews.adjective = 'exceptionally well';
                            break;
                    }
                }

                $scope.product = product;
                $scope.isLoaded = true;

                $scope.getAvailability(product);

                return product;
            };

            // Load product.
            if($routeParams){
                try {
                    $routeParams.query = parseInt($routeParams.query);
                } catch (err){
                    console.error(err);
                }

                var product = Products.find($routeParams.query);

                if(!product){
                    Products.query($routeParams.query, false, function(prd){

                        if(_.isEmpty(prd)){
                            Products.query($routeParams.query, true, function(prdt){
                                if(_.isEmpty(prdt)){
                                    $scope.showProductNotFoundError();
                                } else {
                                    var product = _.first(prd);
                                    rebuildProduct(product);
                                }
                            });

                        } else {
                            var product = _.first(prd);
                            rebuildProduct(product);
                        }
                    });
                } else {
                    rebuildProduct(product);
                }

            }
        }
    ],
    templateUrl: 'product/product',
    url: '/product/:query'
};
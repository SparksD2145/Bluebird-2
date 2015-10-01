/**
 * @file Vehicle Guide start page
 * @author Thomas Ibarra <sparksd2145.dev@gmail.com>
 */
Bluebird.States['VehicleGuideDetails'] = {
    name: 'vehicleGuideDetails',
    templateUrl: 'vehicle-guide/vehicle-details/vehicle-details',
    url: '/vehicle-guide/details/:year/:make/:model',
    controller: [
        '$scope', '$resource','$routeParams', '_',
        'Bluebird.Services.Vehicles',
        function($scope, $resource, $routeParams, _, vehicles){

            $scope.getVehicle = function(){
                $scope.vehicleTrimRequired = false;

                var year = $scope.yearSelected;
                var make = $scope.makeSelected;
                var model = $scope.modelSelected;
                var trim = $scope.trimSelected;

                $scope.vehicleLoading = true;

                vehicles.getVehicle(function(result){

                    if(!result.vehicle && typeof result.trims !== 'undefined'){

                        $scope.vehicleLoading = false;
                        $scope.vehicleTrimRequired = true;

                        $scope.vehicleTrims = result.trims;

                    } else if(result.vehicle){
                        $scope.vehicle = result.vehicle;
                        $scope.vehicleLoading = false;
                    }

                    // @todo: Ensure this is what is actually returned, and error handling


                }, year, make, model, trim);
            };

            if(!_.isEmpty($routeParams) && $routeParams.year && $routeParams.make && $routeParams.model) {
                $scope.yearSelected = $routeParams.year;
                $scope.makeSelected = $routeParams.make;
                $scope.modelSelected = $routeParams.model;
                $scope.trimSelected = $routeParams.trim;

                $scope.getVehicle();
            }
        }
    ]
};
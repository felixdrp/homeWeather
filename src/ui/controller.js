angular.module('myApp')
    .controller('userInterface', [
	'$scope',
	'$document',
	'$interval',
	'sensorDriver',
	function($scope, $document, $interval, sensorDriver) {
	    var plot, phase;
	    $scope.plot = {};

 	    sensorDriver.getSensorList().then(function(data) {
	        $scope.sensors = [data];
	        //angular.$apply;
//console.log(data);
	    });

//console.log(sensorDriver.getSensorList.get(function(data) {return [data];}));
	    

	    
	    $document.on('mousedown', function($event) {
		//plotSin(10);
		//$scope.$apply();
		//console.log('mlk;');
	    });
	    
	    
	    $document.on('mouseup', function($event) {
		//$document.off
		//plotSin(10);
		//$scope.$apply();
		//console.log('mlk;');
	    });

	    $scope.$on('FOCUS_CHANGED', function($event) {
		$scope.plot.p1 = serviceFocus.getFocus();
	    });

	    $scope.presentation1 = 'mlk';
	}])
    .factory('serviceFocus', [
	function() {
	    var focus = 0;
	    
	    return {
		getFocus: function() {
		    return focus;
		},
		setFocus: function(scope, value) {
		    focus = value;
		    scope.$emit('FOCUS_CHANGED');
		}     
	    };
	}]);

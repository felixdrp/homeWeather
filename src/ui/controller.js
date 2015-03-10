//https://ajax.googleapis.com/ajax/libs/angularjs/1.3.4/angular.min.js
//https://code.angularjs.org/1.3.4/angular.min.js
angular.module('myApp')
    .controller('userInterface', [
	'$scope',
	'$document',
	'$resource',
	'$interval',
	'serviceFocus',
	function($scope, $document, $resource, $interval, serviceFocus) {
	    var plot, phase;
	    $scope.plot = {};

	    phase = 0;

	    var sensorlist = $resource('/sensors');
	    sensorlist.get().$promise.then(function(data) {
		    $scope.sensors = [data];
		    angular.$apply;
//console.log(data);
		});   

	    $scope.addE = function() {
		thermalData.push(442.29);
		console.log(thermalData);
		$scope.$apply;
	    };

	    //$scope.plot.p1 = 'M10,10 l10,20 l10,-5 l10,-20 l10,14';
	    $scope.plot.p1 = serviceFocus.getFocus();
	    function plotSin(phase) {
		w = 2 * Math.PI * 2;
		signal = Array.apply(0, Array(100))
		    .map(function (x, y) { return y * 0.005; })
		// Multiply by a negative number because the ref. of the window. 
		    .map(function (x) { return -100 * Math.sin(w * x + phase); });
		plot = 'M10,110 ';
		signal.forEach(function (x, y, z) { var aux = y===0?0:z[y-1]; plot += ' l5,' + (x - aux);});
		$scope.plot.p1 = plot;
		phase += 0.01;
		console.log(plot);
	    }

	    // repeat every 500 miliseconds
	    //$interval(plotSin, 500, 0);
	    
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
    .controller('userInterface2', [
	'$scope',
	'$document',
	'$interval',
	'serviceFocus',
	function($scope, $document, $interval, serviceFocus) {
	    var plot, phase, id = 2;
	    
	    $scope.plot = {};
	    $scope.plot.p1 = serviceFocus.getFocus();
	    $scope.leerFocus = function() {
		serviceFocus.setFocus($scope, id);
		//$scope.plot.p1 = serviceFocus.getFocus();     
	    };

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
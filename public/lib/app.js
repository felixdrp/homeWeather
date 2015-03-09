// Main module of the application
angular.module('myApp', ['ngResource']);

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

'use strict'
angular.module('myApp')
    .directive('confortZone', ['$resource', '$interval', function($resource, $interval) {
	function link(scope, element, attrs) {

	  var plot = '';
	  var xZero = 10;
	  var yZero = 350;
	  var xCoordinateEnd = 510;
	  var yCoordinateEnd = 10;
	  scope.plot = {};

	  // Create a SVG type element
	  function makeSVG(tag, attrs) {
	    var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
	    for (var k in attrs)
	      el.setAttribute(k, attrs[k]);
	    return el;
	  }
	  
//	  element.append(makeSVG("svg", {"id": "graphic"}));

	  // Line of the saturated vapor density related to Temperature
	  signal = Array.apply(0, Array(1000))
	    .map(function (x, y) { var Tc = y * 0.05;
				   return 5.018+0.32321*Tc+8.1847e-3*Math.pow(Tc,2)+3.1243e-4*Math.pow(Tc,3); });
	  // Empirical fit of saturated vapor density (gr/m3) versus Celsius Temperature
	  // http://hyperphysics.phy-astr.gsu.edu/hbase/kinetic/relhum.html#c5
	  signal.forEach(function (x, y, z) { if (y===0) {plot += ' M10,' + (350 -  z[0]*10);} 
					      else { plot += ' l0.5,' + (-(x - z[y-1]))*10;}});
	  scope.plot.p1 = plot;

	  // Lines of humidity
	  // 10%, 20%, 30%, 40%, 60%, 80% of the saturated vapor density (gr/m3) value
	  var pathElement;
	  [1, 2, 3, 4, 6, 8].forEach(function (value, index) {
	    plot = '';
	    signal.forEach(function (x, y, z) { if (y===0) {plot += ' M10,' + (350 - z[0]*10*(value/10));} 
						else { plot += ' l0.5,' + (-(x - z[y-1]))*10*(value/10);}});
	    // Add the path information attribute
	    pathElement = makeSVG('path', {"d":plot});
	    pathElement.classList.add('humidity-line');
	    angular.element(document.getElementById('graphic')).append(pathElement);
	  });

	  // Humidity text
	  var humidityPercentageText;
	  var coordinades;
	  [0, 1, 2, 3, 5, 7].forEach(function (value, index) {
	    // Add the path information attribute
	    console.log(i);
	    if (index < 4) {
	      // Numbers 10, 20, 30 and 40%
	      coordinades = {"x": xCoordinateEnd - 30, "y": yZero - 85 - 80 * value};
	    } else {
	      // Numbers 60 and 80%
	      coordinades = {"x": xCoordinateEnd + 71 - 50 * index, "y": yZero - 80 * 4};
	    }
	    humidityPercentageText = makeSVG('text', coordinades);
	    humidityPercentageText.textContent = (value + 1) + '0%';
	    humidityPercentageText.classList.add('humidity-percentage-text');
	    angular.element(document.getElementById('graphic')).append(humidityPercentageText);
	  })

	  // Confort Zone
	  var pathElement;
	  plot = '';
	  // 40% confort line
	  var value = 4;
	  signal.slice(440, 540).forEach(function (x, y, z) { if (y===0) {plot += ' M230,' + (350 - z[0]*10*(value/10));} 
							      else { plot += ' l0.5,' + (-(x - z[y-1]))*10*(value/10);}});
	  // Jump from 40% to 60%
	  plot += ' l0, -51.5';
	  // 60% confort line
	  var value = 6;
	  signal.slice(440, 540).reverse().forEach(function (x, y, z) { if (y===0) {plot += '';} 
									else { plot += ' l-0.5,' + (-(x - z[y-1]))*10*(value/10);}});
	  plot += ' z';

	  // Add the path information attribute
	  pathElement = makeSVG('path', {"d":plot});
	  pathElement.classList.add('confort-zone-area');
	  angular.element(document.getElementById('graphic')).append(pathElement);

	  // Coordinates axis measures
	  // Temperature
	  var temperatureMeasure = {};
	  var yTextToAxis = 18;
	  for (var i = 0; i < 11; i++) {
	    // Temperature lines
	    plot = 'm' + (xZero + i*50) + ',' + yZero +
	      'l' + 0 + ',' + (-(yZero - yCoordinateEnd));
	    temperatureMeasure.axis = makeSVG('path', {"d": plot});
	    temperatureMeasure.axis.classList.add('coordinate-axis-middle');
	    angular.element(document.getElementById('graphic')).append(temperatureMeasure.axis);

	    plot = 'm' + (xZero + i*50) + ',' + yZero +
	      'l' + 0 + ',' + (-5);
	    temperatureMeasure.axisStart = makeSVG('path', {"d": plot});
	    temperatureMeasure.axisStart.classList.add('coordinate-axis');
	    angular.element(document.getElementById('graphic')).append(temperatureMeasure.axisStart);

	    if (i < 2) {
	      coordinades = {"x": xZero - 5 + i*50, "y": yZero + yTextToAxis};
	    } else {
	      coordinades = {"x": xZero - 10 + i*50, "y": yZero + yTextToAxis};
	    }
	    temperatureMeasure.text = makeSVG('text', coordinades);
	    temperatureMeasure.text.textContent = i * 5;
	    temperatureMeasure.text.classList.add('temperature-measure-text');
	    angular.element(document.getElementById('graphic')).append(temperatureMeasure.text);
	  }
	}

	  return {
	    scope:{},
	    link: link,
	    template: '<svg id="graphic" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg" version="1.1"> ' +
	                 '<path id="saturatedVaporDensity" class="saturated-vapor-density" d="{{plot.p1}}"/>' +
	                 '<text dx="145" dy="-2" class="saturated-vapor-density-text">' +
	                    '<textPath xlink:href="#saturatedVaporDensity">' +
		               'saturated vapor density' +
	                    '</textPath>' +
	                 '</text>' +
	                 '<path class="coordinate-axis"	d="m10,10 l0,340 l500,0 l0,-340"/>' +
                       '</svg>'
	  };
    }]);


angular.module('myApp')
    .directive('sensorDataBox', ['$resource', '$interval', function($resource, $interval) {
	function link(scope, element, attrs) {
	    scope.type = attrs.type;
	    // UpperCase first letter
	    scope.type = scope.type.charAt(0).toUpperCase()[0] + 
		         scope.type.slice(1);
	    scope.lastMeasure = '';
	    scope.sensorConnectionLost = false;
	    
	    if (attrs.type == 'temperature') {	
		scope.imageUrl = "/images/thermometer.svg";
		scope.units = '°C';
	    } else if(attrs.type == 'humidity') {
		scope.imageUrl = "/images/humidity.svg";
		scope.units = '%';
	    }

	    scope.data = [];
	    // Get the max number from an array

	    function GetMax()
	    {
		var max = this[0], i;
		
		for (var i = 0; i < this.length; i++)
		    if (max < this[i])
			max = this[i];

		return Number(max).toFixed(2);
	    }

	    // Get the min number from an array

	    function GetMin()
	    {
		var min = this[0], i;

		for (var i = 0; i < this.length; i++)
		    if (min > this[i])
			min = this[i];

		return Number(min).toFixed(2);
	    }
	    // Get the mean number from an array

	    function GetMean()
	    {
		var mean = 0, i, length = this.length;

		for (var i = 0; i < length; i++)
		    mean += this[i];

		return (mean / length).toFixed(2);
	    }

	    // Get the mean number from an array

	    function StDeviation()
	    {
		var mean = 0, variance = 0, i, length = this.length;

		// Mean.
		for (var i = 0; i < length; i++)
		    mean += this[i];
		mean = mean / length;

		// Variance
		for (var i = 0; i < length; i++)
		    variance += Math.pow(this[i] - mean, 2);

		variance = variance / (length - 1);

		// Standard Deviation
		return Math.sqrt(variance).toFixed(2);
	    }
 
	    Array.prototype.max = GetMax;
	    Array.prototype.min = GetMin;
	    Array.prototype.mean = GetMean;
	    Array.prototype.stDeviation = StDeviation;

	    // Read measure: if the period is not added it will be the last hour
	    var sensorResource = $resource('/sensors/:sensorId/:type/:period', {sensorId:'@id',type:'@type',period:'@period'});

	    readMeasure = function (id, type, period, scope) {
		var query;

		if (period == undefined) {
		    query = {sensorId:id, type:type};
		} else {
		    query = {sensorId:id, type:type, period:period};
		}

console.log('informado' + query + ' ' +type);
		sensorResource.get(query)
		    .$promise.then(function(data) {
			// If the sensor don't have measures of the last hour
			if (data.temperature == undefined | data.temperature == null) {
			    scope.sensorConnectionLost = true;

			    if (scope.lastMeasure==='') {
				scope.lastMeasure = 'It was lost the sensor connection';
				scope.data = [0,0];
			    }
			} else {
			    scope.sensorConnectionLost = false;

			    scope.lastMeasure = data.temperature[data.temperature.length - 1];
			    scope.data = data.temperature;
			}

console.log('mlk ');

			angular.$apply;
		    });
console.log('lastmeasure' + scope.lastMeasure);

	    };

	    readMeasure(attrs.sensorId, attrs.type, '',scope);
//	    updateMeasure = $interval(readMeasure(attrs.sensorId, attrs.type, undefined), 10000);
	    $interval(function (){readMeasure(attrs.sensorId, attrs.type, undefined, scope);}, 10000);
//	    $interval(function () {console.log('jeml');}, 10000);

            scope.$on('$destroy', function() {
console.log('destruido');		
		// Make sure that the interval is destroyed too
		//$interval.cancel(updateMeasure);
            });
	}
	return {
	    scope:{},
	    link: link,
	    templateUrl: '/measureBox'
	};
    }]);


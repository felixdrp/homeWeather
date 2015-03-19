'use strict';
angular.module('myApp')
    .directive('sensorDataBox', [
	'$resource', 
	'$interval', 
	'sensorDriver',
	function($resource, $interval, sensorDriver) {
	    function link(scope, element, attrs) {
		scope.type = attrs.type;
		// Title UpperCase first letter
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
		// sensorDriver.readMeasure(id, type, period);
		sensorDriver.readMeasure(attrs.sensorId, attrs.type, '', scope);
		// Listen the response from server
		scope.$on('sensor_' + attrs.sensorId + '_' + attrs.type, function(event, data) {
		    console.log('recogido dato');
		    console.log(data.temperature);
		    if (data.data == undefined | data.data == null) {
			scope.sensorConnectionLost = true;

			if (scope.lastMeasure==='') {
			    scope.lastMeasure = 'It was lost the sensor connection';
			    scope.data = [0,0];
			}
		    } else {
			scope.sensorConnectionLost = false;

			if (data.period == 'hour') {
			    scope.lastMeasure = data.data[data.data.length - 1];
			    scope.data = data.data;
			} else if (data.period == 'lastMeasure') {
			    scope.lastMeasure = data.data[0];
			    scope.data.shift();
			    scope.data.push(data.data[0]);
			}
			scope.$digest();
		    }
		});
	    }
	    return {
		scope:{},
		link: link,
		templateUrl: '/measureBox'
	    };
	}]);


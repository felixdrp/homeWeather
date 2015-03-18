// Main module of the application
angular.module('myApp', ['ngResource']);

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

'use strict';
angular.module('myApp')
  .directive('confortZone', [
    '$resource',
    '$interval',
    'sensorDriver',
    function($resource, $interval, sensorDriver) {
      function link(scope, element, attrs) {
	// Store the room being shown
	var sensorId;
	// When plotHistoricLine = 2 plot the historic line
	var plotHistoricLine = 0;
	scope.data = {};
	
	var plot = '';
	var xZero = 10;
	var yZero = 350;
	var xCoordinateEnd = 510;
	var yCoordinateEnd = 10;
	// Scale Plot
	var temperaturePixelsByDegree = 10;
	var humidityPixelsByFactor = 10;
	scope.plot = {};

	// Create a SVG type element
	function makeSVG(tag, attrs) {
	  var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
	  for (var k in attrs)
	    el.setAttribute(k, attrs[k]);
	  return el;
	}

	// Empirical fit of saturated vapor density (gr/m3) versus Celsius Temperature
	// http://hyperphysics.phy-astr.gsu.edu/hbase/kinetic/relhum.html#c5
	function saturatedVaporDensity(temperature) {
	  return 5.018 + 0.32321 * temperature + 8.1847e-3 * Math.pow(temperature, 2) + 3.1243e-4 * Math.pow(temperature, 3);
	}
	

	// Line of the saturated vapor density related to Temperature
	signal = Array.apply(0, Array(1000))
	  .map(function (x, y) { var Tc = y * 0.05;
				 return saturatedVaporDensity(Tc); });
	signal.forEach(function (x, y, z) { if (y===0) {plot += ' M10,' + (yZero -  z[0] * humidityPixelsByFactor);}
					    else { plot += ' l0.5,' + (-(x - z[y-1])) * humidityPixelsByFactor;}});
	scope.plot.p1 = plot;

	// Lines of humidity
	// 10%, 20%, 30%, 40%, 60%, 80% of the saturated vapor density (gr/m3) value
	var pathElement;
	[1, 2, 3, 4, 6, 8].forEach(function (value, index) {
	  plot = '';
	  signal.forEach(function (x, y, z) { if (y===0) {plot += ' M10,' + (350 - z[0] * humidityPixelsByFactor * (value / 10));} 
					      else { plot += ' l0.5,' + (-(x - z[y - 1])) * humidityPixelsByFactor * (value / 10);}});
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
	});

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
	var pixelsByFiveDegrees = 5 * temperaturePixelsByDegree;
	for (var i = 0; i < 11; i++) {
	  if (i > 0 && i < 10) {
	    // Temperature lines.
	    plot = 'm' + (xZero + i * pixelsByFiveDegrees) + ',' + yZero + 'l' + 0 + ',' + (-(yZero - yCoordinateEnd));
	    temperatureMeasure.axis = makeSVG('path', {"d": plot});
	    temperatureMeasure.axis.classList.add('coordinate-axis-middle');
	    angular.element(document.getElementById('graphic')).append(temperatureMeasure.axis);
	    // Temperature mini lines.
	    plot = 'm' + (xZero + i * pixelsByFiveDegrees) + ',' + yZero + 'l' + 0 + ',' + (-5);
	    temperatureMeasure.axisStart = makeSVG('path', {"d": plot});
	    temperatureMeasure.axisStart.classList.add('coordinate-axis');
	    angular.element(document.getElementById('graphic')).append(temperatureMeasure.axisStart);
	  }
	  if (i < 2) {
	    coordinades = {"x": xZero - 5 + i * pixelsByFiveDegrees, "y": yZero + yTextToAxis};
	  } else {
	    coordinades = {"x": xZero - 10 + i * pixelsByFiveDegrees, "y": yZero + yTextToAxis};
	  }
	  temperatureMeasure.text = makeSVG('text', coordinades);
	  temperatureMeasure.text.textContent = i * 5;
	  temperatureMeasure.text.classList.add('temperature-measure-text');
	  angular.element(document.getElementById('graphic')).append(temperatureMeasure.text);
	}
	
	// Temperature historic line
	var temperatureHistoryLine = [];
	var lineColor;
	for (var j = 0; j < 60; j++) {
	  // Temperature lines
	  lineColor = 255 - (j * 4);
	  temperatureHistoryLine.push(makeSVG('line', 
		    			      {
		    				"x1": 0,
		    				"y1": 0, 
		    				"x2": 0,
		    				"y2": 0, 
		    				"style":"stroke:rgb(" + lineColor + "," + lineColor + "," + lineColor + ")"
		    			      }));
	  temperatureHistoryLine[j].classList.add('temperature-history');
	  angular.element(document.getElementById('graphic')).append(temperatureHistoryLine[j]);
	}

	// Last measure circle
	var lastMeasureCircle;
	lastMeasureCircle = makeSVG('circle', 
		    	{
		    	  "cx": xZero,
		    	  "cy": yZero, 
		    	  "r": 1
		    	});
	lastMeasureCircle.classList.add('temperature-last-measure');
	angular.element(document.getElementById('graphic')).append(lastMeasureCircle);


/*
  Ask for information to the server
*/

	// Get de SensorList and it is used to create the sensors buttons (VIEW).
	sensorDriver.getSensorList().then(function(data) {
	  scope.sensors = [data];
	  //angular.$apply;
	  console.log(data);
	  scope.showRoomConfort(0);
	});
	
	scope.showRoomConfort = function(roomId) {

	  scope.sensors[roomId].sensors.forEach( function(sensorType) {
	    sensorDriver.readMeasure(scope.sensors[roomId].id, sensorType, '', scope);	    
	    scope.$on('sensor_' + scope.sensors[roomId].id + '_' + sensorType, function(event, data) {
	      console.log('datos llegan a confort');
	      console.log(data.data);
	      if (data.data == undefined | data.data == null) {
		scope.sensorConnectionLost = true;

		if (scope.lastMeasure==='') {
		  scope.lastMeasure = 'It was lost the sensor connection';
		  scope.data[data.type] = [0,0];
		}
	      } else {
		// Add a new measure
		plotHistoricLine = plotHistoricLine + 1;

		scope.sensorConnectionLost = false;
		scope.lastMeasure = data.data[data.data.length - 1];
		scope.data[data.type] = data.data;
		if (plotHistoricLine == 2) {
		  plotHistoricLine = 0;
		  for (var k = 0; k < scope.data.temperature.length - 1; k++) {
		    // Temperature lines
		    temperatureHistoryLine[k].setAttribute("x1", xZero + scope.data.temperature[k] * temperaturePixelsByDegree);
		    temperatureHistoryLine[k].setAttribute("y1", yZero - saturatedVaporDensity(scope.data.temperature[k]) * (scope.data.humidity[k] / 100) * humidityPixelsByFactor);
		    temperatureHistoryLine[k].setAttribute("x2", xZero + scope.data.temperature[k + 1] * temperaturePixelsByDegree);
		    temperatureHistoryLine[k].setAttribute("y2", yZero - saturatedVaporDensity(scope.data.temperature[k + 1]) * (scope.data.humidity[k + 1] / 100) * humidityPixelsByFactor);
		  }
		  lastMeasureCircle.setAttribute("cx", xZero + scope.data.temperature[scope.data.temperature.length - 1] * temperaturePixelsByDegree);
		  lastMeasureCircle.setAttribute("cy", 
						 yZero - 
						 saturatedVaporDensity(scope.data.temperature[scope.data.temperature.length - 1]) * 
						 (scope.data.humidity[scope.data.humidity.length - 1] / 100) * humidityPixelsByFactor);
		}

		scope.$digest();
	      }
	    });

	  });

	};
      }

      // Take humidity and temperature data.
      // Plot the history line.
      
      return {
	scope:{},
	link: link,
	template: '<input type="button" ng-click="" value="{{sensors[0].name}}">'+
	  '<svg id="graphic" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg" version="1.1"> ' +
	  '<path id="saturatedVaporDensity" class="saturated-vapor-density" d="{{plot.p1}}"/>' +
	  '<text dx="145" dy="-2" class="saturated-vapor-density-text">' +
	  '<textPath xlink:href="#saturatedVaporDensity">' +
	  'saturated vapor density' +
	  '</textPath>' +
	  '</text>' +
	  '<path class="coordinate-axis" d="m10,10 l0,340 l500,0 l0,-340"/>' +
          '</svg>'
      };
    }]);

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

			scope.lastMeasure = data.data[data.data.length - 1];
			scope.data = data.data;
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


'use strict';

angular.module('myApp')
    .factory('sensorDriver', [
	'$q',
        '$resource',
	function($q, $resource) {
	    var sensorList;
	    
	    var sensorListScope = [];
	    var webSocketCache = [];
	    var webSocketStatus = false;
	    // Open a WebSocket:
	    //   http://dev.w3.org/html5/websockets/
	    //   https://developer.mozilla.org/en/docs/WebSockets
	    var ws = new WebSocket('ws://' + window.location.hostname + ':' + window.location.port);
	    
	    // On WebSocket error
	    ws.onerror = function(event) {console.error('Socket error event ');console.error(event);};
	    // On WebSocket message
	    ws.onmessage = function(event) {
		var response = JSON.parse(event.data);

		console.log('datagram>' + event.data);
		// Emit the data to the registered scopes.
		sensorListScope.forEach(function(value) {
		    if (value.id == response.id && value.type == response.type) {
			value.scope.forEach(function(sensorScope) {
			    sensorScope.$emit('sensor_' + response.id + '_' + response.type, response);});
		    }
		});
	    };
	    ws.onopen = function(event) {
		console.log(ws);
		webSocketStatus = true;
		webSocketSend();
	    };

	    function webSocketSend(message) {
//console.log(webSocketCache);
//console.log(message);
		if (webSocketStatus == true && ws.readyState == 1) {
		    // WebSocket is ready.
		    // Send the chaced queries.
		    webSocketCache.forEach(function (value, index) {
			ws.send(value);
			console.log(value);
		    });
		    webSocketCache = [];

		    if (message != undefined) {
console.log(message);		
			ws.send(message);
		    }
		} else {
		    // If the WebSocket is not ready then cache the query
		    webSocketCache.push(message);
		}
	    };

	    return {
		getSensorList: function() {
		    // Only get the list one time. Then cached the data in sensorList.
		    return $q(function(resolve, reject) {
			if (sensorList == undefined) {
			    $resource('sensors/').get().$promise.then(function(data) { sensorList = data; resolve(sensorList); },
								      function(error) { reject(error); });
			} else {
			    resolve(sensorList);
			} 
		    });
		},
		readMeasure: function(sensorId,  type, period, scope) {
		    var query = 'sensor/' + sensorId + '/' + type + '/' + period;

		    var sensorIndex = sensorListScope.findIndex(function (sensor, index) { return sensor.query == query; });
		    if (sensorIndex == -1) {
			// Register the sensor and type.
			sensorListScope.push({query: query, id: sensorId, type: type, scope: [scope]});
			webSocketSend(query);
		    } else {
			// Add scope to the query.
			sensorListScope[sensorIndex].scope.push(scope);
		    }
		}     
	    };
	}]);

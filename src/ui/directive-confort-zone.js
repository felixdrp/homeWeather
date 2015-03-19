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
	  temperatureMeasure.text.textContent = i * 5 + '°C';
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
		if (data.period == 'hour') {
		  scope.lastMeasure = data.data[data.data.length - 1];
		  scope.data[data.type] = data.data;
		} else if (data.period == 'lastMeasure') {
		  scope.data[data.type].shift();
		  scope.data[data.type].push(data.data[0]);
		}
		// When plotHistoricLine == 2 whe have two lectures.
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
	  '<svg id="graphic" width="auto" height="80%" viewBox="0 0 550 380" xmlns="http://www.w3.org/2000/svg" version="1.1"> ' +
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

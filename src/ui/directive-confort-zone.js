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

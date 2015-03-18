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

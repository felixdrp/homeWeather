'use strict';

angular.module('myApp')
    .factory('sensorDriver', [
	function() {
	    // Open a WebSocket:
	    //   http://dev.w3.org/html5/websockets/
	    //   https://developer.mozilla.org/en/docs/WebSockets
	    var ws = new WebSocket('ws://' + window.location.hostname + ':' + window.location.port);
	    // On WebSocket error
	    ws.onerror = function(event) {console.error('Socket error event ');console.error(event);};
	    // On WebSocket message
	    ws.onmessage = function(event) {

			console.log('datagram>' + JSON.parse(event.data));
	    };

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

'use strict'

angular.module('myApp')
    .factory('sensorDriver', [
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
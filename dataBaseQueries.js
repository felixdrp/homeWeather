'use strict'

var q = require('q');
// Load the dataBase url
var configApp = require('./config-app');

var pg = require('pg');

var DBQuery = {};

/*To translate variable to DB name*/
function translateToDBVariable(variable) {
    switch (variable) {
      case 'temperature':
	return 't';
	break;
      case 'humidity':
  	return 'h';
	break;
    }
}

DBQuery.lastMeasure = function(sensorId, sensorType) {
    return q.Promise(function(resolve, reject, notify) {
	var client = new pg.Client(configApp.dbUrl);
	var type = translateToDBVariable(sensorType);

	client.connect(function(err) {
	    if (err) {
		reject('could not connect to postgres' + err);
	    }

	    client
		.query("select id, name, (select to_json( array_agg(data -> '" + type + "') ) from sensors_data where timestamp > current_timestamp - interval '1 hour' and timestamp <= current_timestamp and id = " + '1' + ") as temperature from sensors_list where id = " + '1', 

		function(err, result) {
		    if (err) {
			reject('error running query' + err);
		    }
		    //      console.log(result.rows[0]);

		    client.end();
		    
		    if (result.rows[0] == undefined) {
			reject(JSON.stringify({ error: 'sensor not found!!'}));
		    } else {
			resolve(JSON.stringify(result.rows[0]));
		    }
		});
	});
    });
};

// Get last hour
DBQuery.lastHour = function(sensorId, sensorType) {
    return q.Promise(function(resolve, reject, notify) {
	var client = new pg.Client(configApp.dbUrl);
	var type = translateToDBVariable(sensorType);
console.log('type>> ' + type)
console.log('type>> ' + sensorType)
	client.connect(function(err) {
	    if (err) {
		reject('could not connect to postgres' + err);
	    }

	    client
		.query("select id, name, '" + sensorType + "' as type, (select to_json( array_agg(data -> '" + type + "') ) from sensors_data where timestamp > current_timestamp - interval '1 hour' and timestamp <= current_timestamp and id = " + sensorId + ") as data from sensors_list where id = " + sensorId,
		function(err, result) {
		    if (err) {
			reject('error running query' + err);
		    }
		    //      console.log(result.rows[0]);
		    client.end();
		    
		    if (result.rows[0] == undefined) {
			reject(JSON.stringify({ error: 'sensor not found!!'}));
		    } else {
			resolve(JSON.stringify(result.rows[0]));
		    }
		});
	});
    });
};

module.exports = DBQuery;

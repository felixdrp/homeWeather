'use strict';

var q = require('q');
// Load the dataBase url
var configApp = require('./config-app');

var pg = require('pg');


var client = new pg.Client(configApp.dbUrl);

client.connect(function(err) {
    if (err) {
	reject('could not connect to postgres' + err);
    }
});
	    
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
	var type = translateToDBVariable(sensorType);
/*
	select id, name, 'temperature' as type, (select json_build_array( data::jsonb -> 't' ) from sensors_data where id = 1 order by timestamp desc limit 1) as data, (select json_build_array( timestamp ) from sensors_data where id = 1 order by timestamp desc limit 1) as timestamp from sensors_list where id = 1;
 */
	
	client.query("select id, name, '" + sensorType + "' as type, (select json_build_array( data::jsonb -> '" + type + "' ) from sensors_data where id = " + sensorId + " order by timestamp desc limit 1) as data, (select json_build_array( timestamp ) from sensors_data where id = " + sensorId + " order by timestamp desc limit 1) as timestamp from sensors_list where id = " + sensorId,
		     function(err, result) {
			 if (err) {
			     reject('error running query' + err);
			 }
			 //      console.log(result.rows[0]);
			 
			 if (result.rows[0] == undefined) {
			     reject(JSON.stringify({ error: 'sensor not found!!'}));
			 } else {
			     resolve(JSON.stringify(result.rows[0]));
			 }
		     });
    });
    
};

// Get last hour
DBQuery.lastHour = function(sensorId, sensorType) {
    return q.Promise(function(resolve, reject, notify) {
	var type = translateToDBVariable(sensorType);
/*
	select id, name, 'humidity' as type, (select to_json( array_agg(data -> 'h') ) from sensors_data where timestamp > current_timestamp - interval '1 hour' and timestamp <= current_timestamp and id = 1) as data, (select to_json( array_agg(timestamp) ) from sensors_data where timestamp > current_timestamp - interval '1 hour' and timestamp <= current_timestamp and id = 1) as timestamp from sensors_list where id = 1;
*/	
	client.query("select id, name, '" + sensorType + "' as type, (select to_json( array_agg(data -> '" + type + "') ) from sensors_data where timestamp > current_timestamp - interval '1 hour' and timestamp <= current_timestamp and id = " + sensorId + ") as data, (select to_json( array_agg(timestamp) ) from sensors_data where timestamp > current_timestamp - interval '1 hour' and timestamp <= current_timestamp and id = " + sensorId + ") as timestamp from sensors_list where id = " + sensorId,
		     function(err, result) {
			 if (err) {
			     reject('error running query' + err);
			 }
			 
			 if (result.rows[0] == undefined) {
			     reject(JSON.stringify({ error: 'sensor not found!!'}));
			 } else {
			     resolve(JSON.stringify(result.rows[0]));
			 }
		     });
    });
};

module.exports = DBQuery;

'use strict';
var express = require('express');
var router = express.Router();
var pg = require('pg');

//var conString = "postgres://admin:1234@localhost:5433/homeweather";
var conString = "postgres://admin:1234@192.168.1.81:5432/homeweather";

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

/* GET list of sensors. */
router.get('/', function(req, res) {
  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query("select * from sensors_list", function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      console.log(result.rows[0]);
 
      if (result.rows[0] == undefined) {
	  res.status(500).json({ error: 'sensors list not found!!' })
      } else {
	  res.json(result.rows[0]);
      }
      client.end();
    });
  });
});

/* GET the measure of the last hour from the id sensor. */
router.get('/:id([0-9]+)/:type', function(req, res) {
  var client = new pg.Client(conString);
  var type;

  type = translateToDBVariable(req.params.type);

  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query("select id, name, (select to_json( array_agg(data -> '" + type + "') ) from sensors_data where timestamp > current_timestamp - interval '1 hour' and timestamp <= current_timestamp and id = " + req.params.id + ") as temperature from sensors_list where id = " + req.params.id, function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      console.log(result.rows[0]);
      // If it returns an empty response
      if (result.rows[0] == undefined) {
	  res.status(500).json({ error: 'sensor not found!!' })
      } else {
	  res.json(result.rows[0]);
      }
      client.end();
    });
  });
});

/* GET id sensor day lecture. */
router.get('/:id([0-9]+)/:type/:period', function(req, res) {
  var client = new pg.Client(conString);
  var type;

  type = translateToDBVariable(req.params.type);

  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    client.query("select id, name, (select to_json( array_agg(data -> '" + type + "') ) from sensors_data where timestamp >= (timestamp '2014-12-16 11:52:01') and timestamp < (timestamp '2014-12-16 11:52:01' + interval '1000 second') and id = " + req.params.id + ") as temperature from sensors_list where id = " + req.params.id, function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      console.log(result.rows[0]);
 
      if (result.rows[0] == undefined) {
	  res.status(500).json({ error: 'sensor not found!!' })
      } else {
	  res.json(result.rows[0]);
      }
      client.end();
    });
  });
});

module.exports = router;

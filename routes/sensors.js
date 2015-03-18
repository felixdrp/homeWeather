'use strict';
var express = require('express');
var router = express.Router();
var pg = require('pg');
var DBQuery = require('../dataBaseQueries');

// Load dataBase Url
var configApp = require('../config-app');

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
  var client = new pg.Client(configApp.dbUrl);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query("select * from sensors_list", function(err, result) {
	if(err) {
            return console.error('error running query', err);
	}
	//      console.log(result.rows[0]);
 
	client.end();
	if (result.rows[0] == undefined) {
	    res.status(500).json({ error: 'sensors list not found!!' });
	} else {
	    res.json(result.rows[0]);
	}
    });
  });
});

/* GET the measure of the last hour from the id sensor. */
router.get('/:id([0-9]+)/:type', function(req, res) {
    DBQuery.lastHour(req.params.id, req.params.type)
	.then(
	    function (data) {
		res.json(JSON.parse(data));
	    },
	    function (error) {
		res.status(500).json({ error: error });
	    }
	);
});


/* GET id sensor day lecture. */
/*
router.get('/:id([0-9]+)/:type/:period', function(req, res) {
    DBQuery.lastDay(req.params.id, req.params.type)
	.then(
	    function (data) {
		res.json(JSON.parse(data));
	    },
	    function (error) {
		res.status(500).json({ error: error });
	    }
	);
});
*/

module.exports = router;

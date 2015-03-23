#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('app4:server');
var http = require('http');

var DBQuery = require('../dataBaseQueries');
// Websocket
var WebSocketServer = require('ws').Server;

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
* WebSocket Server control
 */
var queryWebSocketList = new Array;
var lastMeasureSend = {
    "temperature": {},
    "humidity": {}
};

var wss = new WebSocketServer({server: server});
wss.on('connection', function (ws) {

    console.log('started websocket client');

    ws.on('close', function () {
	console.log('stopping websocket client');	
	// Remove Websocket from queryWebSocketList
	// If it is the last websocket change the name of the query to destroy a destroy it
	for (var j = queryWebSocketList.length - 1; j >= 0; j--) {
	    if (queryWebSocketList[j].webSockets.length == 1 && queryWebSocketList[j].webSockets[0] == ws) {
		// Destroy the query entry.
		queryWebSocketList[j].query = 'DESTROY!!!';
		clearInterval(queryWebSocketList[j].interval);
		queryWebSocketList.splice(j, 1);
	    } else {
		// Remove the websocket from the query list.
		for (var k = queryWebSocketList[j].webSockets.length - 1; k >= 0; k--) {
		    if (queryWebSocketList[j].webSockets[k] == ws) {
			queryWebSocketList[j].webSockets.splice(k, 1);
			break;
		    }
		}
	    }
	}
	console.log(ws.readyState);
	console.log(queryWebSocketList);
	//clearInterval(id);
    });

    ws.onmessage = function (event) {
	// Check the query.
	var query = /sensor\/(\d+)\/(humidity|temperature)\/(lastMeasure|hour|day)?\/?/g.exec(event.data);
	if (query != null && query.length >= 3) {
console.log(query[0]);

	    DBQuery.lastHour(query[1], query[2])
		.then(function (data) {
		    var addPeriod = JSON.parse(data);
		    addPeriod["period"] = query[3];
		    ws.send(JSON.stringify(addPeriod));},
		      function (error) { console.error(error); });

	    var indexQuery;
//console.log(queryWebSocketList);
	    if (queryWebSocketList.length == 0) {
		indexQuery = -1;
	    } else {
		// Hand made findIndex because it is not soported at the moment
		indexQuery = -1;
		for (var i = 0; i < queryWebSocketList.length; i++ ) {
		    if (queryWebSocketList[i].query == query[1] + '/' + query[2]) {
			indexQuery = i;
			// Search only one ocurrence
			break;
		    }
		}
	    }

	    if (indexQuery == -1) {
		queryWebSocketList.push(
		    {
			"query": query[1] + '/' + query[2],
			// Create an Array of webSocket to serve the last measure.
			"webSockets": [ws],
			// Give the last measure automaticaly
			"interval": '' 
		    });
		// Set interval
		queryWebSocketList[queryWebSocketList.length - 1].interval = setInterval(function () {
		    DBQuery.lastMeasure(query[1], query[2])
			   .then(function (data) {
			       var dataJson = JSON.parse(data);
			       console.log('0>' + dataJson.type);
			       
			       if (lastMeasureSend[dataJson.type].timestamp == undefined ||
				   lastMeasureSend[dataJson.type].timestamp != dataJson.timestamp[0]) {
				       console.log('1>' + lastMeasureSend[dataJson.type].timestamp);
				       console.log('2>' + dataJson.timestamp);
				       lastMeasureSend[dataJson.type].timestamp = dataJson.timestamp[0];
				       dataJson["period"] = 'lastMeasure';
				       queryWebSocketList[queryWebSocketList.length - 1].webSockets.forEach(function (value, index) {
					   value.send(JSON.stringify(dataJson));
				   });
			       }
			   },
			      function (error) { console.error(error); }
			     );
		}, 20000);
	    } else {
		// Search if the websocket is already in the array
		if (queryWebSocketList[indexQuery].webSockets.indexOf(ws) == -1) {
		    // Add Websocket to the list
		    queryWebSocketList[indexQuery].webSockets.push(ws);
		}
	    }
	}
    };
});


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

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

var wss = new WebSocketServer({server: server});
wss.on('connection', function(ws) {
    var queryList;

    console.log('started websocket client');

    ws.on('close', function() {
	     console.log('stopping websocket client');
	     //clearInterval(id);
    });

    ws.onmessage = function(event) {
	// Check the query.
	var query = /sensor\/(\d+)\/(humidity|temperature)\//g.exec(event.data);
	if (query != null && query.length == 3) {
	    console.log(event.data);

	    DBQuery.lastHour(query[1], query[2])
		.then(function (data) { ws.send(data); },
		      function (error) { console.error(error); });

	    // Give the last measure automaticaly
	    setInterval(function(){ 
		DBQuery.lastHour(query[1], query[2])
		    .then(function (data) { ws.send(data); },
			  function (error) { console.error(error); });
	    }, 30000);
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

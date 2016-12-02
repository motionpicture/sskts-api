// #!/usr/bin/env node
/// <reference path='./typings/index.d.ts' />
"use strict";
/**
 * Module dependencies.
 */
let startTime = process.hrtime();
const app = require('./apps/api/app');
// import debugModule = require('debug');
const http = require('http');
// let debug = debugModule('app:server');
/**
 * Get port from environment and store in Express.
 */
let port = normalizePort(process.env.PORT || '8080');
app.set('port', port);
/**
 * Create HTTP server.
 */
let server = http.createServer(app);
/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    let port = parseInt(val, 10);
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
    let bind = typeof port === 'string'
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
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    // debug('Listening on ' + bind);
    console.log('Listening on ' + bind);
    let diff = process.hrtime(startTime);
    console.log(`api server listening took ${diff[0]} seconds and ${diff[1]} nanoseconds.`);
}

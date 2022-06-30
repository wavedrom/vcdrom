/* -eslint-disable no-console */
'use strict';

const http = require('http');
const url = require('url');
const fs = require('fs');

/*global process */

const myArgs = process.argv.slice(2);
//console.log('myArgs: ', myArgs);

const httpPort = myArgs[0];
const sockPort = myArgs[1];
const rootFolder = myArgs[2];
//
// A simple http_server that will serve up requested files.
//
const httpServer = http.createServer(function (req, res) {
  //create web server
  //console.log('Request: ' + req.url);
  const urlObject = url.parse(req.url, true);
  //console.log(urlObject);
  var filename = '';

  filename = rootFolder + '/' + urlObject.pathname.substring(1);
  //console.log(filename);

  if (fs.existsSync(filename)) {
    //console.log('sending: ' + filename);
    if (filename.endsWith('wasm')) {
      // This does not appear to get set automatically, so we must do it.
      res.writeHead(200, { 'Content-Type': 'application/wasm' });
    } else if (filename.endsWith('svg')) {
      // This does not appear to get set automatically, so we must do it.
      res.writeHead(200, { 'Content-Type': 'application/svg+xml' });
    } else {
      res.writeHead(200);
    }
    
    fs.createReadStream(filename).pipe(res);
  } else {
    res.end('Invalid Request!: ' + req.url);
  }
});

httpServer.listen(httpPort, () => {
  // console.log(
  //   'Goto: http://127.0.0.1:' + httpServer.address().port + '/index.html'
  // );
});

//
// Create the relay!  This is all that is needed to incorporate the
// websocket and tcp/ip socket message relay into the web app.
//
const relay = require('./relay.js');
relay.createRelay(httpServer, sockPort);

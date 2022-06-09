/* eslint-disable no-console */
'use strict';

const net = require('net');
const WebSocket = require('ws');
var eventDebug = require('event-debug');

const wsMap = new Map();
const portMap = new Map();

function createRelay(httpServer, socketPort) {
  console.log('create relay');
  var wss = new WebSocket.Server({ server: httpServer });
  eventDebug(wss, 'websocket');

  wss
    .on('connection', (ws, req) => {
      console.log('accept websocket connection');

      ws.on('message', function message(msg) {
        console.log(wsMap.get(ws) + ':' + msg.toString());
        if (socketServer !== null) {
          socketServer.write(wsMap.get(ws) + ':' + msg.toString()); 
        }
      });

      wsMap.set(ws, req.socket.remotePort);
      portMap.set(req.socket.remotePort, ws);
      console.log(portMap.has(req.socket.remotePort) + ' ' + portMap.size);

      console.log('Remote port: ' + wsMap.get(ws));
      if (socketServer !== null) {
        // Notify the other end that a new websocket has opened, a new tab
        socketServer.write(wsMap.get(ws) + ':connected\n');
      }

      ws.send('Connection upgraded to websocket!');
    });

  // Create a server object
  var socketServer = net.createServer((server) => {
    socketServer = server;
    console.log(
      'accept socket connection from ' +
        server.remoteAddress +
        ':' +
        server.remotePort
    );
    server
      .on('data', (data) => {
        var [tid, msg] = data.toString().split(':');
        var id = Number(tid);
        console.log('ID=' + id + ' ' + portMap.has(id) + ' ' + portMap.size);
        console.log('client->: ' + data.toString().trim());
        if (portMap.has(id)) {
          console.log('sending');
          var ws = portMap.get(id);
          ws.send(msg);
        }
      })
      .on('close', () => {
        console.log('socket closed!');
        socketServer = null;
      });
  });
  eventDebug(socketServer, 'socket');

  // Open server on port 9898
  socketServer.listen(socketPort, () => {
    console.log('opened socket server on', socketServer.address().port);
  });
}

exports.createRelay = createRelay;

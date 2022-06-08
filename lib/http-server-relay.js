const http = require("http");
const url = require("url");
const fs = require("fs");

/*global process */

const myArgs = process.argv.slice(2);
console.log("myArgs: ", myArgs);

const http_port = myArgs[0];
const sock_port = myArgs[1];
//
// A simple http_server that will serve up requested files.
//
const http_server = http.createServer(function (req, res) {
  //create web server
  console.log("Request: " + req.url);
  const urlObject = url.parse(req.url, true);
  //console.log(urlObject);
  var filename = "";
  
  filename = "app/" + urlObject.pathname.substring(1);

  if (fs.existsSync(filename)) {
    console.log("sending: " + filename);
    res.writeHead(200);
    fs.createReadStream(filename).pipe(res);
  } else {
    res.end("Invalid Request!: " + req.url);
  }
});

http_server.listen(http_port, () => {
  console.log("Goto: http://127.0.0.1:" + http_server.address().port + "/index.html");
});

//
// Create the relay!  This is all that is needed to incorporate the
// websocket and tcp/ip socket message relay into the web app.
//
const relay = require("./relay.js");
relay.createRelay(http_server, sock_port);

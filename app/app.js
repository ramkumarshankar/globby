//Required libraries
var express = require('express');
var serveStatic = require('serve-static');
var path = require('path');

//Socket-io server
var server = require('http').Server(app);
var io = require('socket.io')(server);

// var server = require('http').createServer()
var url = require('url');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ server: server, port: 8080 });

var app = express();

//Create a manager for our virtual character
var vicManager = require("./js/server/vicmanager.js");
var characterManager = new vicManager();

app.set('view engine', 'ejs');

server.listen(8081);

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
  socket.on('MOVE', function (data) {
    console.log(data);
  });
});

wss.on('connection', function connection(ws) {
  var location = url.parse(ws.upgradeReq.url, true);
  // you might use location.query.access_token to authenticate or share sessions
  // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
  console.log("someone connected!");
  // console.log('received: %s', message);

  ws.on('message', function incoming(message) {
    console.log(message);
    var msgFromProcessing = JSON.parse(message);
    console.log("event: " + msgFromProcessing.event);
    console.log("value " + msgFromProcessing.value);
  });

  ws.send('Hi Jason!\n');
});

app.get('/', function(req, res) {
  res.render('pages/index', {'affectValue': characterManager.getAffectValue()});
});

app.use(serveStatic(__dirname)).listen(8082, function() {
  console.log("I'm listening on port 8082!");
});
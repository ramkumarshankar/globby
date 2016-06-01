//Required libraries
var express = require('express');
var serveStatic = require('serve-static');
var path = require('path');
var ip = require('ip');

//Socket-io server
var server = require('http').Server(app);
var io = require('socket.io')(server);

var url = require('url');
var WebSocketServer = require('ws').Server;

//Remember that we have 3 ports in use
// 8080 - WebSocket Port   - for kinect information
// 8081 - Socket.io port   - for controlling vic and moving it other screens
// 8082 - HTTP server port - the UI is served on this port
var wss = new WebSocketServer({ server: server, port: 8080 });

var app = express();

//Create a manager for our virtual character
var vicManager = require("./js/server/vicmanager.js");
var characterManager = new vicManager();

//Module to manage secondary screens
var clientManager = require("./js/server/clientmanager.js");
var screenManager = new clientManager();

//Keep track of the 'server' - the socket controlling vic
var characterSocket;
var characterSocketID = -1; //not really used now

app.set('view engine', 'ejs');

server.listen(8081);

//Communication with app and secondary screens
io.on('connection', function (socket) {
  socket.on('server', function() {
    characterSocketID = 1; //TODO? - manage clients?
    characterSocket = socket.id;
    console.log("We have a server!");
    //Tell the server the starting emotional state of the character
    socket.emit('init server', characterManager.getAffectValue());
  });
  socket.on('client', function() {
    console.log("we have a client");
    screenManager.addNewClient(socket.id);
    console.log(screenManager.clientList);
    socket.emit('init client', 'client created');
  });
  socket.on('up', function() {
    characterManager.increaseAffectValue();
    socket.emit('update affect', characterManager.getAffectValue());
  });
  socket.on('down', function() {
    characterManager.decreaseAffectValue();
    socket.emit('update affect', characterManager.getAffectValue());
  });
  socket.on('kinect event', function(value) {
    characterManager.setAffectValue(value);
  });
  socket.on('server walk', function(message) {
    if (message == 'complete') {
      var clientSocket = screenManager.selectRandomClientSocketID();
      io.to(clientSocket).emit('client walk', 'start');
    }
  });
  socket.on('client walk', function(message) {
    if (message == 'complete') {
      io.to(characterSocket).emit('server walk', 'start');
    }
  });
});

//Communication with processing sketch and sensors
wss.on('connection', function connection(ws) {
  var location = url.parse(ws.upgradeReq.url, true);
  // you might use location.query.access_token to authenticate or share sessions
  // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
  console.log("someone connected!");
  // console.log('received: %s', message);

  ws.on('message', function incoming(message) {
    var msgFromProcessing = JSON.parse(message);
    console.log(msgFromProcessing);
    //Look for the type of event
    //Kinect detects new user
    if (msgFromProcessing.event=="newUser") {
      io.to(characterSocket).emit('new user', 'new user');
    }
    //Kinect lost user
    else if (msgFromProcessing.event=="lostUser") {
      io.to(characterSocket).emit('lost user', 'lost user');
    }
    //Mirror interaction
    else if (msgFromProcessing.event=="mirror") {
      var wsMsg = {
        event: msgFromProcessing.event,
        frame: msgFromProcessing.frame,
        direction: msgFromProcessing.direction
      };
      io.to(characterSocket).emit('interaction', wsMsg);
    }
    //Bounce interaction
    else if (msgFromProcessing.event=="flap") {
      var wsMsg = {
        event: msgFromProcessing.event,
        status: msgFromProcessing.status
      };
      io.to(characterSocket).emit('interaction', wsMsg);
    }
    //Proximity interaction
    else if (msgFromProcessing.event=="distance") {
      var wsMsg = {
        event: msgFromProcessing.event,
        value: msgFromProcessing.value
      };
      io.to(characterSocket).emit('interaction', wsMsg);
    }
    else if (msgFromProcessing.event=="arduino") {
      var factor = (parseInt(msgFromProcessing.sensor1) + parseInt(msgFromProcessing.sensor2)) / 2;
      characterManager.updateTotalTime();
      characterManager.updateAffectValue(factor);
      console.log(characterManager.getAffectValue());
      io.to(characterSocket).emit('update affect', characterManager.getAffectValue());
    }
  });
});

app.get('/', function(req, res) {
  res.render('pages/index', {'ipAddress': ip.address()});
});

app.get('/client', function(req, res) {
  res.render('pages/client', {'ipAddress': ip.address()});
});


app.use(serveStatic(__dirname)).listen(8082, function() {
  console.log("I'm listening on port 8082!");
});
//Required libraries
var express = require('express');
var serveStatic = require('serve-static');
var path = require('path');

var app = express();

app.set('view engine', 'ejs');

app.get('/p5', function(req, res) {
   res.render('pages/index-p5'); 
});

app.get('/physics', function(req, res) {
   res.render('pages/index-physics'); 
});

app.use(serveStatic(__dirname)).listen(8081, function() {
  console.log("I'm listening on port 8081!");
});
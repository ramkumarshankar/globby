//Define our dependencies here
// var $ = require('jquery');
// var io = require('socket.io-client');

//Creating animations from sprite sheets
var sprite_sheet;
var myAnimation;

// var affectValue = "<%= affectValue %>"
console.log(affectValue);

var socket = io.connect('http://localhost:8081');
socket.on('news', function (data) {
  console.log(data);
  socket.emit('my other event', { my: 'data' });
});

function preload() {
  // specify width and height of each frame and number of frames
  sprite_sheet = loadSpriteSheet('./images/sprite_sheet.png', 426, 433, 8);
  myAnimation = loadAnimation(sprite_sheet);
  myAnimation.playing = false;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(51);
}

function draw() {
  background(51);

  // animate the sprite sheet
  if  (mouseIsPressed) {
    myAnimation.play();
  }
  animation(myAnimation, width/2, height/2);
}


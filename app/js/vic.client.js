//Not used - keeping things simple here for now
//Define our dependencies here
// var $ = require('jquery');
// var io = require('socket.io-client');

//Create a vic sprite
var vic;

//Creating animations from sprite sheets
var sprite_sheet;

//Our character's emotional state
var affectValue = 0;

//Flags to track if an animation is in progress
var bAnimProgress = false;

//Our list of animations

//Sad
var sadBreatheAnimation;
var sadAnimationsList = [];

//Neutral
var neutralBreatheAnimation;
var neutralAnimationsList = [];

//Happy
var happyBlinkAnimation;
var happyBreatheAnimation;
var happyBounceAnimation;
var happyDanceAnimation;
var happyAnimationsList = [];

//Excited
var excitedBreatheAnimation;
var excitedAnimationsList = [];

var sadAnimationsKey = {
  0: 'sadbreathe'
};

var neutralAnimationsKey = {
  0: 'neutralbreathe'
};

var happyAnimationsKey = {
  0: 'happyblink',
  1: 'happybreathe',
  2: 'happydance'
  //Add more animations here
};

var excitedAnimationsKey = {
  0: 'excitedbreathe'
  //Add more animations here
};

//Label of next animation
var nextAnimationLabel;

var socket = io.connect('http://localhost:8081');
socket.on('update client', function(value) {
  affectValue = value;
  console.log(affectValue);
  //Now that we have a starting state, start the draw loop
  loop();
});

function preload() {

}

function setup() {
  // frameRate(24);
  createCanvas(windowWidth, windowHeight);
  socket.emit('client', 'connected');
  noLoop();
}

function draw() {
  background(51);
  
  textSize(32);
  text("word", 10, 30);

}
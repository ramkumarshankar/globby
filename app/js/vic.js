//Not used - keeping things simple here for now
//Define our dependencies here
// var $ = require('jquery');
// var io = require('socket.io-client');

//Creating animations from sprite sheets
var sprite_sheet;

//Our character's emotional state
var affectValue = 0;

//Flags to track if an animation is in progress
var bAnimProgress = false;

//Our list of animations
var happyBlinkAnimation;
var happyBreatheAnimation;
var happyBounceAnimation;
var happyAnimationsList = [];

//Current animation
var currentAnimation;
//Index of next animation
var nextAnimation = -1;

var socket = io.connect('http://localhost:8081');
socket.on('update affect', function(value) {
  affectValue = value;
  console.log(affectValue);
});
socket.on('start', function (data) {
  startBreathe = data;
  console.log(startBreathe);
});

function preload() {
  // specify width and height of each frame and number of frames
  sprite_sheet = loadSpriteSheet('./images/sprite_sheet.png', 426, 433, 8);
  happyBounceAnimation = loadAnimation(sprite_sheet);
  happyBlinkAnimation = loadAnimation("./images/Happy_Blink/Happy_Blink020001.png", "./images/Happy_Blink/Happy_Blink020029.png");
  happyBreatheAnimation = loadAnimation("./images/Happy_Breathe/Happy_Breathe0001.png", "./images/Happy_Breathe/Happy_Breathe0025.png");
  
  //Don't autoplay
  happyBounceAnimation.playing = false;
  happyBlinkAnimation.playing = false;
  happyBreatheAnimation.playing = false;
  
  //Don't loop
  happyBounceAnimation.looping = false;
  happyBlinkAnimation.looping = false;
  happyBreatheAnimation.looping = false;
  
  //Add them to our array
  // happyAnimationsList.push(happyBounceAnimation);
  happyAnimationsList.push(happyBlinkAnimation);
  happyAnimationsList.push(happyBreatheAnimation);
}

function setup() {
  // frameRate(24);
  createCanvas(windowWidth, windowHeight);
  background(51);
  console.log("I'm the server");
  socket.emit('server', 'connected');
}

function draw() {
  background(51);
  
  if (!bAnimProgress) {
    chooseAnimationBasedOnAffect(affectValue);
    console.log(nextAnimation);
  }
  
  runAnimation();

}

function chooseAnimationBasedOnAffect (affectVal) {
  //Near death state
  if (affectVal <= 0.2) {
    
  }
  //Sad state
  if (affectVal <= 0.4) {
    
  }
  //Bored state
  if (affectVal <= 0.6) {
    
  }
  //Happy state
  if (affectVal <= 0.8) {
    var numPossibleAnimations = happyAnimationsList.length;
    nextAnimation = Math.floor(Math.random() * (numPossibleAnimations));
    currentAnimation  = happyAnimationsList[nextAnimation];
  }
  //Excited state
  if (affectVal <= 1.0) {
    
  }
  bAnimProgress = true;
}

function runAnimation () {
  //If there is no current animation, start the next one
  if (bAnimProgress) {
    animation(currentAnimation, width/2, height/2);
    currentAnimation.play();
  }
  //If we're at the last frame, set flag and go to first frame
  if (currentAnimation.getFrame() == currentAnimation.getLastFrame()) {
    bAnimProgress = false;
    currentAnimation.changeFrame(0);
  } 
}


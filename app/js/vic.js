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
  loop();
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
    
  //Add them to our array
  // happyAnimationsList.push(happyBounceAnimation);
  happyAnimationsList.push(happyBlinkAnimation);
  happyAnimationsList.push(happyBreatheAnimation);
  
  initAnimations(happyAnimationsList);
}

function setup() {
  // frameRate(24);
  createCanvas(windowWidth, windowHeight);
  background(51);
  console.log("I'm the server");
  socket.emit('server', 'connected');
  noLoop();
}

function draw() {
  background(51);
  
  if (!bAnimProgress) {
    chooseAnimationBasedOnAffect(affectValue);
    console.log(nextAnimation);
  }
  
  if (nextAnimation >= 0) {
    runAnimation(); 
  }

}

function initAnimations (animationsArray) {
  for (i = 0; i < animationsArray.length; i++) {
    animationsArray[i].playing = false;
    animationsArray[i].looping = false;
  }
}

function chooseAnimationBasedOnAffect (affectVal) {
  //Near death state
  if (affectVal <= 0.2) {
    
  }
  //Sad state
  else if (affectVal <= 0.4) {
    
  }
  //Bored state
  else if (affectVal <= 0.6) {
    
  }
  //Happy state
  else if (affectVal <= 0.8) {
    var numPossibleAnimations = happyAnimationsList.length;
    nextAnimation = Math.floor(Math.random() * (numPossibleAnimations));
    currentAnimation  = happyAnimationsList[nextAnimation];
    
  }
  //Excited state
  else if (affectVal <= 1.0) {
    
  }
  
  if (nextAnimation >= 0) {
    bAnimProgress = true; 
  }
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


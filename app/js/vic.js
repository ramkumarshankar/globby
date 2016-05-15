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
var happyBlinkAnimation;
var happyBreatheAnimation;
var happyBounceAnimation;
var happyAnimationsList = [];

var happyAnimationsKey = {
  0: 'happyblink',
  1: 'happybreathe'
  //Add more animations here
};

//Label of next animation
var nextAnimationLabel;

var socket = io.connect('http://localhost:8081');
socket.on('update affect', function(value) {
  affectValue = value;
  console.log(affectValue);
  //Now that we have a starting state, start the draw loop
  loop();
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
  
  //Some housekeeping - don't autoplay and loop
  initAnimations(happyAnimationsList);
}

function setup() {
  // frameRate(24);
  //Create the sprite
  vic = createSprite(windowWidth/2, windowHeight/2, 600, 500);
  
  //Add our animations to the sprite
  vic.addAnimation("happyblink", happyBlinkAnimation);
  vic.addAnimation("happybreathe", happyBreatheAnimation);

  //Create our canvas
  createCanvas(windowWidth, windowHeight);
  
  //Tell the server that we're ready
  console.log("I'm the server");
  socket.emit('server', 'connected');
  
  noLoop();
}

function draw() {
  background(51);
  
  if (!bAnimProgress) {
    chooseAnimationBasedOnAffect(affectValue);
  }
  
  if (nextAnimationLabel) {
    //Check if we have completed the animation
    runAnimation(); 
  }
  
  drawSprites();

}

function initAnimations (animationsArray) {
  for (i = 0; i < animationsArray.length; i++) {
    animationsArray[i].playing = false;
    animationsArray[i].looping = false;
  }
}

function chooseAnimationBasedOnAffect (affectVal) {
  var selectedAnimationIndex = -1;
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
    selectedAnimationIndex = Math.floor(Math.random() * (numPossibleAnimations));
    nextAnimationLabel = happyAnimationsKey[selectedAnimationIndex];
    vic.changeAnimation(nextAnimationLabel);
  }
  //Excited state
  else if (affectVal <= 1.0) {
    
  }
  
  if (selectedAnimationIndex >= 0) {
    bAnimProgress = true; 
  }
}

function runAnimation () {
  //If there is no current animation, start the next one
  if (bAnimProgress) {
    vic.animation.play();
  }
  //If we're at the last frame, set flag and go to first frame
  if (vic.animation.getFrame() == vic.animation.getLastFrame()) {
    bAnimProgress = false;
    vic.animation.changeFrame(0);
  } 
}


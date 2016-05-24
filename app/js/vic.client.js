//Not used - keeping things simple here for now
//Define our dependencies here
// var $ = require('jquery');
// var io = require('socket.io-client');

//Create a vic sprite
var vic;

//Flags to track if an animation is in progress
// var bAnimProgress = false;
var bWalk =  false;
var bBlink = false;

//Only need animations for the walk
var neutralBreatheAnimation;
var neutralWalkAnimation;
var neutralAnimationsList = [];

var neutralAnimationsKey = {
  0: 'neutralbreathe',
  1: 'neutralwalk'
};

//Label of next animation
var nextAnimationLabel;

var socket = io.connect('http://' + ipAddress + ':8081');
socket.on('init client', function(value) {
  //We know about this client, start animation loop
  console.log('client initialized');
  loop();
});
socket.on('client walk', function(value) {
  //Initialize the character walking across the screen
  console.log('received client walk');
  bWalk = true;
  loop();
});

function preload() {
  //Neutral Animations
  neutralBreatheAnimation = loadAnimation("./images/Neutral_Breathe/Neutral_Breathe0001.png", "./images/Neutral_Breathe/Neutral_Breathe0025.png");
  neutralWalkAnimation = loadAnimation("./images/Neutral_Walk_InPlace/Neutral_Walk_InPlace0001.png", "./images/Neutral_Walk_InPlace/Neutral_Walk_InPlace0012.png");
}

function setup() {
  //Create the sprite
  vic = createSprite(windowWidth/2, windowHeight/2, 600, 500);
  
  vic.addAnimation("neutralwalk", neutralWalkAnimation);
  vic.addAnimation("neutralbreathe", neutralBreatheAnimation);
  
  createCanvas(windowWidth, windowHeight);
  socket.emit('client', 'connected');
  vic.scale = 0.3;
  vic.position.x = windowWidth + 150;
  vic.position.y = windowHeight/2;
  vic.changeAnimation('neutralwalk');
  noLoop();
}

function draw() {
  background(51);
  
  if (bWalk) {
    if (vic.getAnimationLabel() == 'neutralwalk') {
      playWalk(); 
    }
  }
  
  runAnimation();
  
  drawSprites();
  
  checkEnd();
}

function runAnimation () {
  //If there is no current animation, start the next one
  vic.animation.play();
  
  //Check if we're in the middle of the screen
  if (vic.getAnimationLabel() == 'neutralwalk') {
    if (!bBlink) {
      if (vic.animation.getFrame() == vic.animation.getLastFrame()) {
        checkBlink(); 
      }
    }
  }
  
  //Check for neutral breathing
  if (vic.getAnimationLabel() == 'neutralbreathe') {
    if (vic.animation.getFrame() == vic.animation.getLastFrame()) {
      resetAnimation();
    }
  }

}

function resetAnimation() {
    // bAnimProgress = false;
    vic.animation.changeFrame(0);
    nextAnimationLabel = 'neutralwalk';
    vic.changeAnimation(nextAnimationLabel);
}

function playWalk () {
  if ((vic.animation.getFrame() >= 4) && (vic.animation.getFrame() <= 8)) {
    vic.velocity.x = -3;
  }
  else {
    vic.velocity.x = 0;
  }
}

function checkBlink() {
  if (vic.position.x <= windowWidth/2+20) {
    bBlink = true;
    vic.animation.changeFrame(0);
    nextAnimationLabel = 'neutralbreathe';
    vic.changeAnimation(nextAnimationLabel);
    vic.velocity.x = 0;
  }
}

function checkEnd() {
  if (vic.position.x < -100) {
    vic.position.x = windowWidth+100;
    bBlink = false;
    noLoop();
    socket.emit('client walk', 'complete');
    console.log('client walk complete');
    //TODO: socket.emit message to say walk is complete
  }
}
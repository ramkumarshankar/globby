//Not used - keeping things simple here for now
//Define our dependencies here
// var $ = require('jquery');
// var io = require('socket.io-client');

//Create our character sprite
var vic;

//Our character's emotional state
var affectValue = 0;

//Idle state
//Flags to track if an animation is in progress
var bIdle = true;
var bAnimProgress = false;

//Kinect related variables
var bKinect = false;
var bSurprise = false;
var bMirror = false;
var bMirrorEnd;
var bSquat = false;
var bSquatEnd;
var bBounce = false;
var bActiveWalk = false;
var bActiveWalkEnd = false;

//Walk about
var bWalk = false;
var bWalkCompleted = false;

//Our list of animations

//Active
var mirrorAnimation;
var bounceAnimation;
var squatAnimation;

//Sounds
var bSoundProgress = false;
var bounceSound;
var squatSound;
var mirrorSound;
var walkSound;

//Near-death
var dyingBreatheAnimation;
var dyingAnimationsList = [];

//Sad
var sadBreatheAnimation;
var sadAnimationsList = [];

//Neutral
var neutralBreatheAnimation;
var neutralWalkAnimation;
var neutralYawnAnimation;
var neutralAnimationsList = [];

//Happy
var happyBlinkAnimation;
var happyBreatheAnimation;
var happyDanceAnimation;
var happyAnimationsList = [];

//Excited
var excitedBreatheAnimation;
var excitedDanceAnimation;
var excitedIdleAnimation;
var excitedAnimationsList = [];

var dyingAnimationsKey = {
  0: 'dyingbreathe'
};

var sadAnimationsKey = {
  0: 'sadbreathe'
};

var neutralAnimationsKey = {
  0: 'neutralbreathe',
  1: 'neutralyawn',
  2: 'neutralwalk'
  
};

var happyAnimationsKey = {
  0: 'happyblink',
  1: 'happybreathe',
  2: 'happydance'
  //Add more animations here
};

var excitedAnimationsKey = {
  0: 'excitedbreathe',
  1: 'exciteddance',
  2: 'excitedidle'
  //Add more animations here
};

//Label of next animation
var nextAnimationLabel;

//Values for the background
//Sad colour gradients
var sadRainSlow = [];
var sadRainFast = [];

var socket = io.connect('http://' + ipAddress + ':8081');
socket.on('init server', function(value) {
  affectValue = value;
  console.log(affectValue);
  //Now that we have a starting state, start the draw loop
  loop();
});
socket.on('update affect', function (value) {
  if (!bKinect) {
    affectValue = value;
    console.log(affectValue); 
  }
});
socket.on('new user', function (message) {
  if (!bMirror) {
    initKinect(); 
  }
});
socket.on('lost user', function (message) {
  endKinect();
});
socket.on('interaction', function (message) {
  // console.log(message.event);
  // console.log(message.direction);
  console.log(message);
  if (message.event == 'mirror') {
    if (bKinect) {
      if (message.direction == 'left') {
        vic.mirrorX(-1);
        bMirror = true;
      }
      else if (message.direction == 'right') {
        vic.mirrorX(1);
        bMirror = true;
      }
      else if (message.direction == 'center') {
        bMirrorEnd = true;
      }
    }
  }
  if (message.event == 'squat') {
    if (bKinect) {
      if (message.value == 'down') {
        bSquat = true;
      }
      else if (message.value == 'up') {
        bSquatEnd = true;
      } 
    }
  }
  if (message.event == 'flap') {
    if (bKinect) {
      bBounce = true;
    }
  }
  if (message.event == 'distance') {
    if (message.value == 'close') {
      bActiveWalk = true;
    } else if (message.value == 'far') {
      if (!bActiveWalk) {
        bActiveWalkEnd = true; 
      }
    }
  }
});
socket.on('server walk', function (message) {
  if (message == 'start') {
    console.log('server walk started');
    bWalkCompleted = true;
    loop();
  }
});

function preload() {
  
  //Surprise Animation
  surpriseAnimation = loadAnimation("./images/Surprise/Dying_to_Surprised0001.png", "./images/Surprise/Dying_to_Surprised0013.png");
  
  //Active interactions
  mirrorAnimation = loadAnimation("./images/Interaction_Mirror/Interaction_MirrorRight0001.png", "./images/Interaction_Mirror/Interaction_MirrorRight0017.png");
  // bounceAnimation = loadAnimation("./images/Interaction_Bounce_InPlace/Interaction_Bounce020001.png", "./images/Interaction_Bounce_InPlace/Interaction_Bounce020011.png");
  bounceAnimation = loadAnimation("./images/Interaction_Bounce/Interaction_Bounce0001.png", "./images/Interaction_Bounce/Interaction_Bounce0011.png");
  bounceAnimation.looping=false;
  squatAnimation = loadAnimation("./images/Interaction_Squish/Interaction_Squish0001.png", "./images/Interaction_Squish/Interaction_Squish0018.png");
  
  bounceSound = loadSound("./sounds/bounce.mp3");
  squatSound = loadSound("./sounds/squat.mp3");
  mirrorSound = loadSound("./sounds/mirror.mp3");
  walkSound = loadSound("./sounds/walk.mp3");
  
  //Dying Animations
  dyingBreatheAnimation = loadAnimation("./images/Dying_Breathe//Dying_Breathe0001.png", "./images/Dying_Breathe//Dying_Breathe0035.png")
  
  //Sad Animations
  sadBreatheAnimation = loadAnimation("./images/Sad_Breathe/Sad_Breathe0001.png", "./images/Sad_Breathe/Sad_Breathe0035.png");
  
  //Neutral Animations
  neutralBreatheAnimation = loadAnimation("./images/Neutral_Breathe/Neutral_Breathe0001.png", "./images/Neutral_Breathe/Neutral_Breathe0025.png");
  neutralWalkAnimation = loadAnimation("./images/Neutral_Walk_InPlace/Neutral_Walk_InPlace0001.png", "./images/Neutral_Walk_InPlace/Neutral_Walk_InPlace0012.png");
  neutralYawnAnimation = loadAnimation("./images/Neutral_Yawn/Neutral_Yawn0001.png", "./images/Neutral_Yawn/Neutral_Yawn0027.png");
  // neutralWalkAnimation = loadAnimation("./images/Neutral_Walk/Neutral_Walk0001.png", "./images/Neutral_Walk/Neutral_Walk0012.png");
  
  //Happy Animations
  happyBlinkAnimation = loadAnimation("./images/Happy_Blink/Happy_Blink010001.png", "./images/Happy_Blink/Happy_Blink010029.png");
  happyBreatheAnimation = loadAnimation("./images/Happy_Breathe/Happy_Breathe0001.png", "./images/Happy_Breathe/Happy_Breathe0025.png");
  happyDanceAnimation = loadAnimation("./images/Happy_Dance/Happy_Dance0001.png", "./images/Happy_Dance/Happy_Dance0033.png");
  
  //Excited Animations
  excitedBreatheAnimation = loadAnimation("./images/Excited_Breathe/Excited_Breathe0001.png", "./images/Excited_Breathe/Excited_Breathe0025.png");
  excitedDanceAnimation = loadAnimation("./images/Excited_Dance/Excited_Dance0001.png", "./images/Excited_Dance/Excited_Dance0033.png");
  excitedIdleAnimation = loadAnimation("./images/Interaction_Idle/Interaction_Idle0001.png", "./images/Interaction_Idle/Interaction_Idle0010.png");
    
  //Add them to our arrays
  dyingAnimationsList.push(dyingBreatheAnimation);
  
  sadAnimationsList.push(sadBreatheAnimation);
  
  // neutralAnimationsList.push(neutralWalkAnimation);
  neutralAnimationsList.push(neutralBreatheAnimation);
  neutralAnimationsList.push(neutralYawnAnimation);
  
  happyAnimationsList.push(happyBlinkAnimation);
  happyAnimationsList.push(happyBreatheAnimation);
  happyAnimationsList.push(happyDanceAnimation);
  
  excitedAnimationsList.push(excitedBreatheAnimation);
  excitedAnimationsList.push(excitedDanceAnimation);
  excitedAnimationsList.push(excitedIdleAnimation);
  
  //Some housekeeping - don't autoplay and loop
  initAnimations(happyAnimationsList);
}

function setup() {
  // frameRate(24);
  
  //Create the sprite
  vic = createSprite(windowWidth/2, windowHeight/2, 600, 500);
  
  //Add our animations to the sprite
  vic.addAnimation("surprise", surpriseAnimation);
  
  //Active states
  vic.addAnimation("mirror", mirrorAnimation);
  vic.addAnimation("bounce", bounceAnimation);
  vic.addAnimation("squat", squatAnimation);
  
  //Passive states
  vic.addAnimation("dyingbreathe", dyingBreatheAnimation);
  vic.addAnimation("sadbreathe", sadBreatheAnimation);
  
  vic.addAnimation("neutralwalk", neutralWalkAnimation);
  vic.addAnimation("neutralbreathe", neutralBreatheAnimation);
  vic.addAnimation("neutralyawn", neutralYawnAnimation);
  
  vic.addAnimation("happyblink", happyBlinkAnimation);
  vic.addAnimation("happybreathe", happyBreatheAnimation);
  vic.addAnimation("happydance", happyDanceAnimation);
  
  vic.addAnimation("excitedbreathe", excitedBreatheAnimation);
  vic.addAnimation("exciteddance", excitedDanceAnimation);
  vic.addAnimation("excitedidle", excitedIdleAnimation);

  //Create our canvas
  createCanvas(windowWidth-4, windowHeight-4);
  
  //Tell the server that we're ready
  console.log("I'm the server");
  socket.emit('server', 'connected');
  
  vic.scale = 0.8;
  
  for (var i = 0; i < 100; i++) {
    sadRainSlow.push(new Rain(0));
  }
  for (var i = 0; i < 100; i++) {
    sadRainFast.push(new Rain(1));
  }
  
  noLoop();
}

function draw() {
  clear();
  // background(51);
  noStroke();
  
  //TODO: draw background based on affect
  drawBackgroundBasedOnAffect(affectValue);
  
  //Kinect available
  if (bKinect) {
    bIdle = false;
    bAnimProgress = true;
    if (!bSurprise) {
      nextAnimationLabel = 'surprise'; 
    }
    else {
      if (bMirror) {
        nextAnimationLabel = 'mirror';
        mirrorUser(); 
      }
      else if (bSquat) {
        nextAnimationLabel = 'squat';
        squatCharacter();
      }
      else if (bBounce) {
        nextAnimationLabel = 'bounce';
        bounceCharacter();
      }
      else if (bActiveWalk || bActiveWalkEnd) {
        nextAnimationLabel = neutralAnimationsKey[2];
        activeWalk(1.2);
      }
      else {
        if (!nextAnimationLabel) {
          nextAnimationLabel = excitedAnimationsKey[2];
        }
      }
    }
    vic.changeAnimation(nextAnimationLabel);
  }
  
  // We're disabling walk about for now, needs more testing and refinement
  // if (bIdle) {
  //   if (!bAnimProgress) {
  //     walkOrAnimation(affectValue);
  //   }
  // }
  
  //Idle states
  if (bIdle) {
    bKinect = false;
    if (!bAnimProgress) {
      chooseAnimationBasedOnAffect(affectValue);
    }
  }
  
  //Walk around
  if (bWalk) {
    //Character walks around to different screens
    nextAnimationLabel = neutralAnimationsKey[2];
    vic.changeAnimation(nextAnimationLabel);
    playWalk();
    checkWalk();
  }
  
  if (nextAnimationLabel) {
    // Check if we have completed the animation
    runAnimation(); 
  }
  
  drawSprites();

}

function walkOrAnimation(affectVal) {
  //if the character is bored
  if ((affectVal > 0.4) && (affectVal <= 0.6)) {
    var probability = Math.random();
    console.log(probability);
    if (probability < 0.4) {
      bWalk = true;
      bIdle = false;
    }
    else {
      bIdle = true;
      bWalk = false;
    }
  }
}

function initAnimations (animationsArray) {
  for (i = 0; i < animationsArray.length; i++) {
    animationsArray[i].playing = false;
    animationsArray[i].looping = false;
  }
}

function drawBackgroundBasedOnAffect (affectVal) {
  //Sad state and near death
  if (affectVal <= 0.4) {
    // background(255,255);
    
    // document.body[0].style.background = "linear-gradient(rgb(20,118,131), rgb(0,32,95))";
    document.body.className = 'sad';
    for (var i=0; i<100; i++) {
      sadRainSlow[i].run();
    }
    for (var i=0; i<100; i++) {
      sadRainFast[i].run();
    }
    // document.getElementsByTagName("body")[0].style.background = "linear-gradient(rgb(20,118,131), rgb(0,32,95))";
    // document.body.style.backgroundImage = "url('./images/SadBG.svg')";
  }
  //Happy and neutral state
  else if (affectVal <= 0.8) {
    // background(51);
    // document.body[0].style.background = "linear-gradient(rgb(92,92,92), rgb(44,44,44));";
    document.body.className = 'neutral';
    // document.getElementsByTagName("body")[0].style.background = "linear-gradient(rgb(92,92,92), rgb(44,44,44));";
    // document.body.style.backgroundImage = "url('./images/NeutralBG.svg')";
  }
  //Excited state
  else if (affectVal <= 1.0) {
    // background(51);
    // document.body[0].style.background = "linear-gradient(rgb(197,0,130), rgb(132,14,205));";
    document.body.className = 'excited';
    // document.getElementsByTagName("body")[0].style.background = "linear-gradient(rgb(197,0,130), rgb(132,14,205));";
    // document.body.style.backgroundImage = "url('./images/InteractionBG.svg')";
  }
}

function chooseAnimationBasedOnAffect (affectVal) {
  var selectedAnimationIndex = -1;
  //Near death state
  if (affectVal <= 0.2) {
    var numPossibleAnimations = dyingAnimationsList.length;
    selectedAnimationIndex = Math.floor(Math.random() * (numPossibleAnimations));
    nextAnimationLabel = dyingAnimationsKey[selectedAnimationIndex];
    vic.changeAnimation(nextAnimationLabel);
  }
  //Sad state
  else if (affectVal <= 0.4) {
    var numPossibleAnimations = sadAnimationsList.length;
    selectedAnimationIndex = Math.floor(Math.random() * (numPossibleAnimations));
    nextAnimationLabel = sadAnimationsKey[selectedAnimationIndex];
    vic.changeAnimation(nextAnimationLabel);
  }
  //Bored state
  else if (affectVal <= 0.6) {
    var numPossibleAnimations = neutralAnimationsList.length;
    selectedAnimationIndex = Math.floor(Math.random() * (numPossibleAnimations));
    nextAnimationLabel = neutralAnimationsKey[selectedAnimationIndex];
    vic.changeAnimation(nextAnimationLabel);
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
    var numPossibleAnimations = excitedAnimationsList.length;
    selectedAnimationIndex = Math.floor(Math.random() * (numPossibleAnimations));
    nextAnimationLabel = excitedAnimationsKey[selectedAnimationIndex];
    vic.changeAnimation(nextAnimationLabel);
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
  
  if (bMirror) {
    mirrorUser('right', 1);
    return;
  }
  
  //If we're at the last frame, set flag and go to first frame
  if (vic.animation.getFrame() == vic.animation.getLastFrame()) {
    resetAnimation();
  } 
}

function playWalk () {
  //The character is jumping in the air in these frames
  if ((vic.animation.getFrame() >= 4) && (vic.animation.getFrame() <= 8)) {
    vic.velocity.x = -6;
  }
  else {
    vic.velocity.x = 0;
  }
}

function checkWalk() {  
  //If vic is out of the frame
  if (vic.position.x < -600) {
    socket.emit('server walk', 'complete');
    console.log('server walk complete');
    vic.position.x = windowWidth+600;
    noLoop();
  }
}

//Using this for development and testing
function keyPressed() {
  if (keyCode == UP_ARROW) {
    socket.emit('up');
  } else if (keyCode == DOWN_ARROW) {
    socket.emit('down');
  } else if ((key == 'k') || (key == 'K')) {
    initKinect();
  } else if ((key == 'o') || (key == 'O')) {
    endKinect();
  } else if ((key == 'r') || (key == 'R')) {
    if (bKinect) {
      if (!bMirror) {
        vic.mirrorX(-1);
        bMirror = true;
        // nextAnimationLabel = 'mirror';
        // vic.changeAnimation(nextAnimationLabel); 
      } else {
        bMirrorEnd = true;
      }
    }
    
  } else if ((key == 's') || (key == 'S')) {
    if (bKinect) {
      if (!bSquat) {
        bSquat = true;
      } else {
        bSquatEnd = true;
      }
    }
    
  } else if ((key == 'l') || (key == 'L')) {
    if (bKinect) {
      if (!bBounce) {
        bBounce = true; 
      }
      else {
        bBounce = false;
      }
    }
    
  } else if ((key == 'w') || (key == 'W')) {
    bActiveWalk = true;
  } else if ((key == 'e') || (key == 'E')) {
    if (!bActiveWalk) {
      bActiveWalkEnd = true; 
    }
  }
  return false;
}

function resetAnimation() {
  var currentAnimationLabel = vic.getAnimationLabel();
  if (currentAnimationLabel == 'surprise') {
    nextAnimationLabel = excitedAnimationsKey[1];
    vic.animation.changeFrame(0);
    vic.changeAnimation(nextAnimationLabel);
    bSurprise = true;
  }
  else {
    bAnimProgress = false;
    vic.animation.changeFrame(0);
    nextAnimationLabel = '';
  }
  //If the walk is completed, go to neutral breathe
  if (bWalkCompleted) {
    if (vic.position.x <= windowWidth/2) {
      bWalkCompleted = false;
      bWalk = false;
      bIdle = true;
      vic.velocity.x = 0;
      nextAnimationLabel = neutralAnimationsKey[0];
      vic.changeAnimation(nextAnimationLabel);
    }
  }

}

function initKinect () {
  bKinect = true;
  bSurprise = false;
  affectValue = 0.9;
  socket.emit("kinect event", affectValue);
  console.log("new kinect user");
}

function endKinect () {
  bKinect = false;
  bIdle = true;
  bSurprise = false;
  bMirror = false;
  bMirrorEnd = false;
  bSquat = false;
  bSquatEnd = false;
  console.log("kinect user left");
}

function mirrorUser() {
  if (!bSoundProgress) {
    mirrorSound.play();
    bSoundProgress = true;
  }
  //If we interrupted another animation, reset that
  var currentAnimationLabel = vic.getAnimationLabel();
  if (currentAnimationLabel != 'mirror') {
    vic.animation.changeFrame(0);
  }
  if (!bMirrorEnd) {
    if (vic.animation.getFrame() == 11) {
      vic.animation.changeFrame(7);
    }
    return; 
  }
  if (vic.animation.getFrame() == vic.animation.getLastFrame()) {
    // Skip this, move to excited idle
    // nextAnimationLabel = excitedAnimationsKey[2];
    bMirror = false;
    bMirrorEnd = false;
    bSoundProgress = false;
  }
}


function squatCharacter() {
  if (!bSoundProgress) {
    squatSound.play();
    bSoundProgress = true;
  }
  //If we interrupted another animation, reset that
  var currentAnimationLabel = vic.getAnimationLabel();
  if (currentAnimationLabel != 'squat') {
    vic.animation.changeFrame(0);
  }
  if (!bSquatEnd) {
    if (vic.animation.getFrame() == 12) {
      vic.animation.changeFrame(8);
    }
    return; 
  }
  if (vic.animation.getFrame() == vic.animation.getLastFrame()) {
    // Skip this, move to excited idle
    // nextAnimationLabel = excitedAnimationsKey[2];
    bSquat = false;
    bSquatEnd = false;
    bSoundProgress = false;
  }
}

function bounceCharacter () {
  //Granular control of our bounce, needed if we use the 'in-place' frames
  // if ((vic.animation.getFrame() >= 2) && (vic.animation.getFrame() <= 3)) {
  //   vic.velocity.y = -20;
  // }
  // else if ((vic.animation.getFrame() >= 4) && (vic.animation.getFrame() <= 5)) {
  //   vic.velocity.y = -2;
  // }
  // else if ((vic.animation.getFrame() >= 6) && (vic.animation.getFrame() <= 7)) {
  //   vic.velocity.y = 2;
  // }
  // else if ((vic.animation.getFrame() >= 8) && (vic.animation.getFrame() <= 9)) {
  //   vic.velocity.y = 20;
  // }
  // else {
  //   vic.velocity.y = 0;
  // }
  //If we interrupted another animation, reset that
  if (!bSoundProgress) {
    bounceSound.play();
    bSoundProgress = true;
  }
  var currentAnimationLabel = vic.getAnimationLabel();
  if (currentAnimationLabel != 'bounce') {
    vic.animation.changeFrame(0);
  }
  //If the bounce is complete, reset
  if (vic.animation.getFrame() == vic.animation.getLastFrame()) {
    // vic.animation.changeFrame(0);
    // Skip this, go to excited idle
    // nextAnimationLabel = excitedAnimationsKey[0];
    bBounce = false;
    bSoundProgress = false;
  }
}

function activeWalk (endScale) {
  //The character is jumping in the air in these frames
  if (bActiveWalkEnd) {
    if (vic.scale > 0.8) {
      if ((vic.animation.getFrame() >= 4) && (vic.animation.getFrame() <= 8)) {
        vic.scale -= 0.01;
      }
      else {
        if (!bSoundProgress) {
          walkSound.play();
          bSoundProgress = true;
        }
      }
    }
    if (vic.scale <= 0.8) {
      vic.scale = 0.8;
      bActiveWalk = false;
      bActiveWalkEnd = false;
      bSoundProgress = false;
      // nextAnimationLabel = excitedAnimationsKey[2];
    }
  }
  else {
    if (vic.scale < endScale) {
      if ((vic.animation.getFrame() >= 4) && (vic.animation.getFrame() <= 8)) {
        vic.scale += 0.01;
      }
      else {
        if (!bSoundProgress) {
          walkSound.play();
          bSoundProgress = true;
        }
      }
    }
    if (vic.scale > endScale) {
      vic.scale = endScale;
    }
    if (vic.scale === endScale) {
      bActiveWalk = false;
      bSoundProgress = false;
    }
  }
}

var Rain = function (type) {
  this.position = createVector(Math.floor(Math.random() * (windowWidth)), Math.floor(Math.random() * (windowHeight)));
  this.type = type; 
}

Rain.prototype.run = function() {
  this.update();
  this.render();
}

Rain.prototype.update = function () {
  if (this.type == 0) {
    this.position.y++;
  }
  else if (this.type == 1) {
    this.position.y = this.position.y + 2;
  }
  if(this.position.y > windowHeight){
    this.position.y = 0;
  }
};

Rain.prototype.render = function () {
  strokeWeight(1);
  stroke(255, 100);
  line(this.position.x, this.position.y, this.position.x, this.position.y + 10);
};

function stars() {
  var x, y;
  fill(225, 225, 225);
  for (var i = 0; i < 100; i++) {
    x = Math.floor(Math.random() * (windowWidth));
    y = Math.floor(Math.random() * (windowHeight));
    ellipse(x,y,10,10);
  }
}

function setGradient(x, y, w, h, c1, c2, axis) {

  noFill();

  if (axis == Y_AXIS) {  // Top to bottom gradient
    for (var i = y; i <= y+h; i++) {
      var inter = map(i, y, y+h, 0, 1);
      var c = lerpColor(c1, c2, inter);
      stroke(c);
      line(x, i, x+w, i);
    }
  }  
  else if (axis == X_AXIS) {  // Left to right gradient
    for (var i = x; i <= x+w; i++) {
      var inter = map(i, x, x+w, 0, 1);
      var c = lerpColor(c1, c2, inter);
      stroke(c);
      line(i, y, i, y+h);
    }
  }
}
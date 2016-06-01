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

var rectHeight = 150;

//Label of next animation
var nextAnimationLabel;

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
      if (message.status == 'true') {
        bSquat = true;
      }
      else if (message.status == 'false') {
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
  
  myBubble = new Bubble();
  
  noLoop();
}

function draw() {
  clear();
  background(51);
  // drawBackground();
  // myBubble.run();
  // ellipse(100,100,100,100);
  
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
  affectValue = 0.7;
  socket.emit("kinect event", affectValue);
  console.log("new kinect user");
}

function endKinect () {
  bKinect = false;
  bIdle = true;
  bSurprise = false;
  bMirror = false;
  bMirrorEnd = false;
  console.log("kinect user left");
}

function mirrorUser() {
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
  }
}


function squatCharacter() {
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
  }
}

function activeWalk (endScale) {
  //The character is jumping in the air in these frames
  if (bActiveWalkEnd) {
    if (vic.scale > 0.8) {
      if ((vic.animation.getFrame() >= 4) && (vic.animation.getFrame() <= 8)) {
        vic.scale -= 0.01;
      }
    }
    if (vic.scale <= 0.8) {
      vic.scale = 0.8;
      bActiveWalk = false;
      bActiveWalkEnd = false;
      // nextAnimationLabel = excitedAnimationsKey[2];
    }
  }
  else {
    if (vic.scale < endScale) {
      if ((vic.animation.getFrame() >= 4) && (vic.animation.getFrame() <= 8)) {
        vic.scale += 0.01;
      }
    }
    if (vic.scale > endScale) {
      vic.scale = endScale;
    }
    if (vic.scale === endScale) {
      bActiveWalk = false;
    }
  }
}

var Bubble = function() {
  this.position = createVector(Math.floor(Math.random() * (windowWidth)), -100);
  this.color = color(225, 225, 225);
  this.radius = 100; 
};

Bubble.prototype.run = function() {
  this.update();
  this.render();
}

Bubble.prototype.update = function () {
  this.position.y++;
};

Bubble.prototype.isDead = function () {
  if (this.position.y > windowHeight + 100) {
    return true;
  }
  return false;
};

Bubble.prototype.render = function () {
  fill (this.color);
  ellipse(this.position.x, this.position.y, this.radius, this.radius);
};

function drawBackground() {
  //Let's draw some rectangles
  noFill();
  strokeWeight(2);
  stroke(225);
  //Top row
  rect(0, 0, windowWidth/4, rectHeight);
  rect(windowWidth/4, 0, windowWidth/2, rectHeight);
  rect(windowWidth*0.75, 0, windowWidth/4, rectHeight);
  //Second row
  rect(0, rectHeight, windowWidth/2, rectHeight);
}

function stars() {
  var x, y;
  fill(225, 225, 225);
  for (var i = 0; i < 100; i++) {
    x = Math.floor(Math.random() * (windowWidth));
    y = Math.floor(Math.random() * (windowHeight));
    ellipse(x,y,10,10);
  }
}
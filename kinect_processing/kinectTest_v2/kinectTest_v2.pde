/* --------------------------------------------------------------------------
 * SimpleOpenNI User3d Test
 * --------------------------------------------------------------------------
 * Processing Wrapper for the OpenNI/Kinect 2 library
 * http://code.google.com/p/simple-openni
 * --------------------------------------------------------------------------
 * prog:  Max Rheiner / Interaction Design / Zhdk / http://iad.zhdk.ch/
 * date:  12/12/2012 (m/d/y)
 * ----------------------------------------------------------------------------
 */
 
import SimpleOpenNI.*;
import wsp5.*;

//websocket sending data
WsClient client;
String wsData;


//kinect
SimpleOpenNI context;
float        zoomF =0.5f;
float        rotX = radians(180);  // by default rotate the hole scene 180deg around the x-axis, 
                                   // the data from openni comes upside down
float        rotY = radians(0);
boolean      autoCalib=true;

PVector      bodyCenter = new PVector();
PVector      bodyDir = new PVector();
PVector      com = new PVector();                                   
PVector      com2d = new PVector();                                   
color[]       userClr = new color[]{ color(255,0,0),
                                     color(0,255,0),
                                     color(0,0,255),
                                     color(255,255,0),
                                     color(255,0,255),
                                     color(0,255,255)
                                   };

//joint position vectors
//instance
  PVector headPos = new PVector();
  PVector neckPos = new PVector();
  PVector rightShoulderPos = new PVector();
  PVector rightElbowPos = new PVector();
  PVector rightHandPos = new PVector();
  PVector leftShoulderPos = new PVector();
  PVector leftElbowPos = new PVector();
  PVector leftHandPos = new PVector();
  PVector torsoPos = new PVector();
  PVector rightHipPos = new PVector();
  PVector rightKneePos = new PVector();
  PVector rightFootPos = new PVector();
  PVector leftHipPos = new PVector();
  PVector leftKneePos = new PVector();
  PVector leftFootPos = new PVector();
  
  //history instance
  float headPosHisX, leftHandPosHisY, rightHandPosHisY;
  boolean rightHandFlap, leftHandFlap;
  PVector headPosHis = new PVector();
  PVector neckPosHis = new PVector();
  PVector rightShoulderPosHis = new PVector();
  PVector rightElbowPosHis = new PVector();
  PVector rightHandPosHis = new PVector();
  PVector leftShoulderPosHis = new PVector();
  PVector leftElbowPosHis = new PVector();
  PVector leftHandPosHis = new PVector();
  PVector torsoPosHis = new PVector();
  PVector rightHipPosHis = new PVector();
  PVector rightKneePosHis = new PVector();
  PVector rightFootPosHis = new PVector();
  PVector leftHipPosHis = new PVector();
  PVector leftKneePosHis = new PVector();
  PVector leftFootPosHis = new PVector();
  String directionHis = "center";

  //TIMER FOR DIFFERENT INTERACTIONS
  int flapTimerHistory = 0;
  int mirrorTimerHistory = 0;
  boolean mirrorCenterSent = false;
  
  //distance
  String distanceHis, distance;
  

void setup()
{
  
  try {
    client = new WsClient( this, "ws://10.19.244.216:8080/");
    client.connect();
  } catch ( Exception e ){
  }
  
  size(1024,768,P3D);  // strange, get drawing error in the cameraFrustum if i use P3D, in opengl there is no problem
  context = new SimpleOpenNI(this);
  if(context.isInit() == false)
  {
     println("Can't init SimpleOpenNI, maybe the camera is not connected!"); 
     exit();
     return;  
  }

  // disable mirror
  context.setMirror(false);

  // enable depthMap generation 
  context.enableDepth();

  // enable skeleton generation for all joints
  context.enableUser();

  stroke(255,255,255);
  smooth();  
  perspective(radians(45),
              float(width)/float(height),
              10,150000);            
  
  // flap status
  rightHandFlap = false;
  leftHandFlap = false;
  
 }

void draw()
{
  // update the cam
  context.update();

  background(0,0,0);
  
  // set the scene pos
  translate(width/2, height/2, 0);
  rotateX(rotX);
  rotateY(rotY);
  scale(zoomF);
  
  int[]   depthMap = context.depthMap();
  int[]   userMap = context.userMap();
  int     steps   = 3;  // to speed up the drawing, draw every third point
  int     index;
  PVector realWorldPoint;
 
  translate(0,0,-1000);  // set the rotation center of the scene 1000 infront of the camera
  
  // draw the skeleton if it's available
  int[] userList = context.getUsers();
  for(int i=0;i<userList.length;i++)
  {
    if(context.isTrackingSkeleton(userList[i])){
      drawSkeleton(userList[i]);
      getJointPosition(userList[i]);
      
      //if the status of split is true
      //if the status of bouncing is true
      
      println("torsoPos.x: " + torsoPos.x);
      
      if(torsoPos.x > 680 || torsoPos.x < -680){
       client.send("{\"event\":" + "\"lostUser\"" + "}");
       println("{\"event\":" + "\"lostUser\"" + "}");
      } 
      
      
      if( torsoPos.z > 1000 && torsoPos.z < 2200 ) {
       
        if(torsoPos.z > 1600){
          distance = "far";    
        } else {
          distance = "close"; 
        }
        
        if(distance != distanceHis){
          String distanceDataWS = "{\"event\":\"" + "distance" + "\",\"value\":\"" + distance + "\"}";
          client.send(distanceDataWS);
        
          distanceHis = distance;
        }
                  
        //else send the mirroing data
        validFlap();              
        
        if((millis()-flapTimerHistory)>5000){
          mirrorData(userList[i]);  
        }
         
      }   
      
    }
    
    // draw the center of mass
    if(context.getCoM(userList[i],com))
    {
      stroke(100,255,0);
      strokeWeight(1);
      beginShape(LINES);
        vertex(com.x - 15,com.y,com.z);
        vertex(com.x + 15,com.y,com.z);
        
        vertex(com.x,com.y - 15,com.z);
        vertex(com.x,com.y + 15,com.z);

        vertex(com.x,com.y,com.z - 15);
        vertex(com.x,com.y,com.z + 15);
        endShape();
      
      fill(0,255,100);
      text(Integer.toString(userList[i]),com.x,com.y,com.z);
    }      
  }    
 
  // draw the kinect cam
  context.drawCamFrustum();
}


//====================================================================================
//====================================================================================
//====================================================================================
//====================================================================================
//====================================================================================
//====================================================================================
//====================================================================================
//====================================================================================
//====================================================================================
//=====================START OF MY CODE===============================================


void getJointPosition(int userId){
  
  //get history data
  if(headPos != null){
   headPosHisX = headPos.x;
   neckPosHis = neckPos;
   rightShoulderPosHis = rightShoulderPos;
   rightElbowPosHis = rightElbowPos;
   rightHandPosHis = rightHandPos;
   rightHandPosHisY = rightHandPos.y;
   leftShoulderPosHis = leftShoulderPos;
   leftElbowPosHis = leftElbowPos;
   leftHandPosHis = leftHandPos;
   leftHandPosHisY = leftHandPos.y;
   torsoPosHis = torsoPos;
   rightHipPosHis = rightHipPos;
   rightKneePosHis = rightKneePos;
   rightFootPosHis = rightFootPos;
   leftHipPosHis = leftHipPos;
   leftKneePosHis = leftKneePos;
   leftFootPosHis = leftFootPos;
  } 
  
  //give position values to the instances
  context.getJointPositionSkeleton(userId,SimpleOpenNI.SKEL_HEAD,headPos);
  context.getJointPositionSkeleton(userId,SimpleOpenNI.SKEL_NECK,neckPos);
  context.getJointPositionSkeleton(userId,SimpleOpenNI.SKEL_RIGHT_SHOULDER,leftShoulderPos);
  context.getJointPositionSkeleton(userId,SimpleOpenNI.SKEL_RIGHT_ELBOW,leftElbowPos);
  context.getJointPositionSkeleton(userId,SimpleOpenNI.SKEL_RIGHT_HAND,leftHandPos);
  context.getJointPositionSkeleton(userId,SimpleOpenNI.SKEL_LEFT_SHOULDER,rightShoulderPos);
  context.getJointPositionSkeleton(userId,SimpleOpenNI.SKEL_LEFT_ELBOW,rightElbowPos);
  context.getJointPositionSkeleton(userId,SimpleOpenNI.SKEL_LEFT_HAND,rightHandPos);
  context.getJointPositionSkeleton(userId,SimpleOpenNI.SKEL_TORSO,torsoPos);
  context.getJointPositionSkeleton(userId,SimpleOpenNI.SKEL_RIGHT_HIP,leftHipPos);
  context.getJointPositionSkeleton(userId,SimpleOpenNI.SKEL_RIGHT_KNEE,leftKneePos);
  context.getJointPositionSkeleton(userId,SimpleOpenNI.SKEL_RIGHT_FOOT,leftFootPos);
  context.getJointPositionSkeleton(userId,SimpleOpenNI.SKEL_LEFT_HIP,rightHipPos);
  context.getJointPositionSkeleton(userId,SimpleOpenNI.SKEL_LEFT_KNEE,rightKneePos);
  context.getJointPositionSkeleton(userId,SimpleOpenNI.SKEL_LEFT_FOOT,rightFootPos);
  
  //detect the status of boucing and spliting
}


void mirrorData(int userId){
   float baseDis = dist(rightShoulderPos.x,rightShoulderPos.y, leftShoulderPos.x, leftShoulderPos.y);
   float headMove = abs(headPos.x - torsoPos.x);
   String direction; 
   
   float headMovePortion = headMove/baseDis;
   int frames = 20;
   int headMoveFinalData = 0;
   
   if(headMovePortion > 0.1) {
    headMoveFinalData = (int)(frames*((headMovePortion-0.1)/0.9)); 
   } 
   
   if((headPos.x - torsoPos.x)<-80){
    direction = "right";
   } else if((headPos.x - torsoPos.x)>80){
    direction = "left";
   } else {
     direction = "center";
   }
 
   if(direction != directionHis) {
     if (millis() - mirrorTimerHistory > 750) {
       String mirrorDataWS = "{\"event\":\"" + "mirror" + "\",\"frame\":\"" + headMoveFinalData + "\",\"direction\":\"" + direction + "\"}";
       client.send(mirrorDataWS);
       mirrorTimerHistory = millis();
       directionHis = direction; 
     }
   }
     
   
}


void validFlap(){
  
  //LEFT HAND
  
  if(leftHandPos.y > torsoPos.y){
    //if the handFlap boolean value is false
    // start comparing the handPos.y and handPosHisY
    // if the handPos.y < handPosHisY
    // turn the value to true; 
    if(!leftHandFlap){
       if((leftHandPos.y - leftHandPosHisY)<-10){
          leftHandFlap = true;
       } 
    }
    
    //if the handFlag boolean value is true
    //detect whether there is a sudden up movement
    //if so, send a data of flag
     if(leftHandFlap){
       if((leftHandPos.y - leftHandPosHisY)>30){
//        println("a left hand flap!");
          String flapDataWS = "{\"event\":\"" + "flap" + "\",\"status\":" + true + "}";
          client.send(flapDataWS);
          flapTimerHistory = millis();
          leftHandFlap = false;
       } 
     }  
  } 
  
  // RIGHT HAND 
  if(rightHandPos.y > torsoPos.y){
    if(!rightHandFlap){
       if((rightHandPos.y - rightHandPosHisY)<-10){
          rightHandFlap = true;
       } 
    }
   
     if(rightHandFlap){
       if((rightHandPos.y - rightHandPosHisY)>30){
//          println("a right hand flap!");
//          println("{\"event\":\"" + "flap" + "\",\"status\":" + true + "}");
          String flapDataWS = "{\"event\":\"" + "flap" + "\",\"status\":" + true + "}";
          client.send(flapDataWS);
          flapTimerHistory = millis();
          rightHandFlap = false;
       } 
     } 
  }
  
}

void mousePressed(){
 client.send("{\"event\":" + "\"lostUser\"" + "}");
}

void keyPressed(){
 if(key == 'n' || key == 'N'){
  client.send("{\"event\":" + "\"newUser\"" + "}"); 
 } else if(key == 'l' || key == 'L'){
   client.send("{\"event\":" + "\"lostUser\"" + "}");
 }
 
 if(key == 'a'){
    String mirrorDataWS = "{\"event\":\"" + "mirror" + "\",\"frame\":\"" + 0 + "\",\"direction\":\"" + "left" + "\"}";
    client.send(mirrorDataWS);
    println(millis());  
 } 
 
 if(key == 's'){
    String mirrorDataWS = "{\"event\":\"" + "mirror" + "\",\"frame\":\"" + 0 + "\",\"direction\":\"" + "center" + "\"}";
    client.send(mirrorDataWS);  
     println(millis());   
 }
 
 if(key == 'd'){
    String mirrorDataWS = "{\"event\":\"" + "mirror" + "\",\"frame\":\"" + 0 + "\",\"direction\":\"" + "right" + "\"}";
    client.send(mirrorDataWS); 
    println(millis());    
 }
 
 if(key == 'f'){
    String flapDataWS = "{\"event\":\"" + "flap" + "\",\"status\":" + true + "}";
    client.send(flapDataWS); 
 }
}

//====================================================================================
//====================================================================================
//====================================================================================
//====================================================================================
//====================================================================================
//====================================================================================
//====================================================================================
//====================================================================================
//====================================================================================
//=====================END OF MY CODE=================================================


// draw the skeleton with the selected joints
void drawSkeleton(int userId)
{
  strokeWeight(3);

  // to get the 3d joint data
  drawLimb(userId, SimpleOpenNI.SKEL_HEAD, SimpleOpenNI.SKEL_NECK);

  drawLimb(userId, SimpleOpenNI.SKEL_NECK, SimpleOpenNI.SKEL_LEFT_SHOULDER);
  drawLimb(userId, SimpleOpenNI.SKEL_LEFT_SHOULDER, SimpleOpenNI.SKEL_LEFT_ELBOW);
  drawLimb(userId, SimpleOpenNI.SKEL_LEFT_ELBOW, SimpleOpenNI.SKEL_LEFT_HAND);

  drawLimb(userId, SimpleOpenNI.SKEL_NECK, SimpleOpenNI.SKEL_RIGHT_SHOULDER);
  drawLimb(userId, SimpleOpenNI.SKEL_RIGHT_SHOULDER, SimpleOpenNI.SKEL_RIGHT_ELBOW);
  drawLimb(userId, SimpleOpenNI.SKEL_RIGHT_ELBOW, SimpleOpenNI.SKEL_RIGHT_HAND);

  drawLimb(userId, SimpleOpenNI.SKEL_LEFT_SHOULDER, SimpleOpenNI.SKEL_TORSO);
  drawLimb(userId, SimpleOpenNI.SKEL_RIGHT_SHOULDER, SimpleOpenNI.SKEL_TORSO);

  drawLimb(userId, SimpleOpenNI.SKEL_TORSO, SimpleOpenNI.SKEL_LEFT_HIP);
  drawLimb(userId, SimpleOpenNI.SKEL_LEFT_HIP, SimpleOpenNI.SKEL_LEFT_KNEE);
  drawLimb(userId, SimpleOpenNI.SKEL_LEFT_KNEE, SimpleOpenNI.SKEL_LEFT_FOOT);

  drawLimb(userId, SimpleOpenNI.SKEL_TORSO, SimpleOpenNI.SKEL_RIGHT_HIP);
  drawLimb(userId, SimpleOpenNI.SKEL_RIGHT_HIP, SimpleOpenNI.SKEL_RIGHT_KNEE);
  drawLimb(userId, SimpleOpenNI.SKEL_RIGHT_KNEE, SimpleOpenNI.SKEL_RIGHT_FOOT);  

  // draw body direction
  getBodyDirection(userId,bodyCenter,bodyDir);
  
  bodyDir.mult(200);  // 200mm length
  bodyDir.add(bodyCenter);
  
  stroke(255,200,200);
  line(bodyCenter.x,bodyCenter.y,bodyCenter.z,
       bodyDir.x ,bodyDir.y,bodyDir.z);

  strokeWeight(1);
 
}

void drawLimb(int userId,int jointType1,int jointType2)
{
  PVector jointPos1 = new PVector();
  PVector jointPos2 = new PVector();
  float  confidence;
  
  // draw the joint position
  confidence = context.getJointPositionSkeleton(userId,jointType1,jointPos1);
  confidence = context.getJointPositionSkeleton(userId,jointType2,jointPos2);

  stroke(255,0,0,confidence * 200 + 55);
  line(jointPos1.x,jointPos1.y,jointPos1.z,
       jointPos2.x,jointPos2.y,jointPos2.z);
  
  drawJointOrientation(userId,jointType1,jointPos1,50);
}

void drawJointOrientation(int userId,int jointType,PVector pos,float length)
{
  // draw the joint orientation  
  PMatrix3D  orientation = new PMatrix3D();
  float confidence = context.getJointOrientationSkeleton(userId,jointType,orientation);
  if(confidence < 0.001f) 
    // nothing to draw, orientation data is useless
    return;
    
  pushMatrix();
    translate(pos.x,pos.y,pos.z);
    
    // set the local coordsys
    applyMatrix(orientation);
    
    // coordsys lines are 100mm long
    // x - r
    stroke(255,0,0,confidence * 200 + 55);
    line(0,0,0,
         length,0,0);
    // y - g
    stroke(0,255,0,confidence * 200 + 55);
    line(0,0,0,
         0,length,0);
    // z - b    
    stroke(0,0,255,confidence * 200 + 55);
    line(0,0,0,
         0,0,length);
  popMatrix();
}

// -----------------------------------------------------------------
// SimpleOpenNI user events

void onNewUser(SimpleOpenNI curContext,int userId)
{
  println("onNewUser - userId: " + userId);
  println("\tstart tracking skeleton");
  
  if(userId > 1){
      
  }
  
  client.send("{\"event\":" + "\"newUser\"" + "}");

  if(userId == 2){
    
  }
  
  context.startTrackingSkeleton(userId);
}

void onLostUser(SimpleOpenNI curContext,int userId)
{
  println("onLostUser - userId: " + userId);
//  client.send("{\"event\":" + "\"lost user\"" + "}");
}

void onVisibleUser(SimpleOpenNI curContext,int userId)
{
  //println("onVisibleUser - userId: " + userId);
}


//// -----------------------------------------------------------------
//// Keyboard events
//
//void keyPressed()
//{
//  switch(key)
//  {
//  case ' ':
//    context.setMirror(!context.mirror());
//    break;
//  }
//    
//  switch(keyCode)
//  {
//    case LEFT:
//      rotY += 0.1f;
//      break;
//    case RIGHT:
//      // zoom out
//      rotY -= 0.1f;
//      break;
//    case UP:
//      if(keyEvent.isShiftDown())
//        zoomF += 0.01f;
//      else
//        rotX += 0.1f;
//      break;
//    case DOWN:
//      if(keyEvent.isShiftDown())
//      {
//        zoomF -= 0.01f;
//        if(zoomF < 0.01)
//          zoomF = 0.01;
//      }
//      else
//        rotX -= 0.1f;
//      break;
//  }
//}

void getBodyDirection(int userId,PVector centerPoint,PVector dir)
{
  PVector jointL = new PVector();
  PVector jointH = new PVector();
  PVector jointR = new PVector();
  float  confidence;
  
  // draw the joint position
  confidence = context.getJointPositionSkeleton(userId,SimpleOpenNI.SKEL_LEFT_SHOULDER,jointL);
  confidence = context.getJointPositionSkeleton(userId,SimpleOpenNI.SKEL_HEAD,jointH);
  confidence = context.getJointPositionSkeleton(userId,SimpleOpenNI.SKEL_RIGHT_SHOULDER,jointR);
  
  // take the neck as the center point
  confidence = context.getJointPositionSkeleton(userId,SimpleOpenNI.SKEL_NECK,centerPoint);
  
  /*  // manually calc the centerPoint
  PVector shoulderDist = PVector.sub(jointL,jointR);
  centerPoint.set(PVector.mult(shoulderDist,.5));
  centerPoint.add(jointR);
  */
  
  PVector up = PVector.sub(jointH,centerPoint);
  PVector left = PVector.sub(jointR,centerPoint);
    
  dir.set(up.cross(left));
  dir.normalize();
}

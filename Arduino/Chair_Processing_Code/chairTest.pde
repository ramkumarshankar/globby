//IDEA Studio 9102 Project - Team 3
//=========================================================

import processing.serial.*;  //Serial Communication Library

Serial myPort; // Making an object of Serial class

String inString = "";// for receiving the string data from Arduino

//variables to store readings from sensor passed on by the arduino
int user1Sitting; 
int user2Sitting;

//websocket library
import wsp5.*;

WsClient client;
String wsData;

void setup()
{
  //arduino chair
  // selecting the bluetooth port and setting speed at 9600 baud
  myPort = new Serial(this, Serial.list()[1], 9600);
  myPort.bufferUntil('\n');// storing in buffer until line break
  
  //websocket: connecting to the correct IP and port
  try 
  {
    client = new WsClient( this, "ws://10.19.244.216:8080/");
    client.connect();
  } 
  catch ( Exception e ){}
}

void draw()
{
  
}


//the serial event function to read whenever there is incoming data from Arduino
void serialEvent (Serial myPort) {
  
  //Reading the incoming string from the arduino until line break
  inString = myPort.readStringUntil('\n');

  //checking that the string is not empty and of the correct length
  if ((inString != null) && (inString.length() == 13)){
    
    String chair1, chair2;
    
    // extracting only the 0 or 1 value from the incoming string
    // and storing them in new variables
    chair1 = inString.substring(4,5); 
    chair2 = inString.substring(10,11);
    
    String arduinoDataWS = "{\"event\":\"" + "arduino" + "\",\"sensor1\":\"" + chair1 + "\",\"sensor2\":\"" + chair2 + "\"}";
   // sending the received values through websockets to the server for further processing
    client.send(arduinoDataWS);
    println(arduinoDataWS);
  }
}
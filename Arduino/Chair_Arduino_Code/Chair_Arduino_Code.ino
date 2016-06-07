
//IDEA Studio 9102 Project - Team 3
//=========================================================

// Allocating pin numbers
int flexPin1 = A2; 
int flexPin2 = A3;

// Variable to store sensor values
int flexValue1;
int flexValue2;

// Variables to store the caliberated value
int chair1Avg = 0;
int chair2Avg = 0;

// To check if the user is sitting or not
int user1Sitting = 0;
int user2Sitting = 0;

// Delay between sending values
int interval = 1000;


void setup() 
{ 
  Serial.begin(9600);
  calibrateSensor();
} 


void loop() 
{    
  checkChair1();
  checkChair2();

  Serial.print("CH1:");Serial.print(user1Sitting); Serial.print(",");
  Serial.print("CH2:");Serial.println(user2Sitting);

  delay(interval);
} 

//Function to take the average of first 10 values 
// to calibrate the sensor before user is sitting
void calibrateSensor()
{
  for (int i = 0; i < 10; i++) 
  {
    chair1Avg += analogRead(flexPin1);
    chair2Avg += analogRead(flexPin2);
    delay(100);
  }

  chair1Avg /= 10;
  chair2Avg /= 10;
}

// function to check if someone is sitting on chair 1
void checkChair1 ()
{
  flexValue1 = analogRead(flexPin1);

  // check if the sensor value is less than calibrated value - 100
  if (flexValue1 < (chair1Avg - 100))
  { user1Sitting = 1;} // send 1 is the user is sitting
  else 
  { user1Sitting = 0;} // send 0 is the user is not sitting
}

// function to check if someone is sitting on chair 1
void checkChair2 ()
{
  flexValue2 = analogRead(flexPin2);

  // check if the sensor value is less than calibrated value - 100
  if (flexValue2 < (chair2Avg - 100))
  { user2Sitting = 1;} // send 1 is the user is sitting
  else 
  { user2Sitting = 0;}// send 0 is the user is not sitting 
}

//=========================================================

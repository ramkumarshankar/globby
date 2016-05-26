//IDEA Studio 9102 Project
//Author: Ahmed Sabeeh Abid (aabi0651)
//=========================================================

int flexPin1 = A2; 
int flexPin2 = A3;

int flexValue1;
int flexValue2;

int chair1Avg = 0;
int chair2Avg = 0;

int chair1SittingTimer = 0;
int chair2SittingTimer = 0;

int chair1StandingTimer = 0;
int chair2StandingTimer = 0;

int user1Sitting = 0;
int user2Sitting = 0;

int minute = 3;
int interval = 3000;

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

void checkChair1 ()
{
  flexValue1 = analogRead(flexPin1);
  if (flexValue1 < (chair1Avg - 100))
  {
    user1Sitting = 1;
  }
  else 
  {
    user1Sitting = 0;
  }
}


void checkChair2 ()
{
  flexValue2 = analogRead(flexPin2);
  if (flexValue2 < (chair2Avg - 100))
  {
    user2Sitting = 1;
  }
  else {
    user2Sitting = 0;
  } 
}

//=========================================================

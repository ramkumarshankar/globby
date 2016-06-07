//IDEA Studio 9102 Project - Team 3
//=========================================================

float positionChange = 0.5; // to manage the speed of particles
int particleCount = 10; // total number of particles 

Particle[] particles;

void setup() 
{
    size(700,700,P2D);
    frameRate(60);
  
    particles = new Particle[particleCount];
    // initiating all the particles
    for(int i=0; i<particleCount; i++) 
    { particles[i] = new Particle();} 
}

void draw() 
 {
    background(#555555);
    noStroke();
    fill(#F7DB02);
          
    translate(width/2, height/2);
  
    for(int i=0; i<particleCount; i++) 
    {
      particles[i].updatePosition(); // updating particle position
      particles[i].display(); // generating the particle shape
    }
 }


class Particle 
{  
  PVector position;
  float angle;
  float spread;
  float angleChange;

  
Particle() 
{
  position = new PVector(0,0);
  angle  = random(TWO_PI);
  spread = 0.01;
  angleChange = 0;    
}



void updatePosition() 
{
  // credits: Pawel Tokarz - http://www.openprocessing.org/sketch/84553
  // equation to generate the random path of the particle
  float a = spread * atan(15*angleChange)/PI;
  float random = (random(2)-1) * spread - a; 
  
  angleChange+=random;                                                      
  angle+=angleChange;     
  
  position.x+=positionChange*cos(angle);            
  position.y+=positionChange*sin(angle);
}
  
  
void display() 
{
     pushMatrix(); 
     
     beginShape();
     
     // assigning the point to generate the particle from
     translate(position.x, position.y); 
     
     // rotating the particle
     rotate(angle); 
     
     // Using Suprformula to make the Insulin structure shape
     for (float theta = 0; theta < 2 * PI; theta += 0.01)
     {
       float rad = pow(pow(abs(cos(8 * theta/4.0) / 2), 2.6) + 
                   pow(abs(sin(8 * theta/4.0) / 2), 2.8), -1.0/1) ;

        float x = rad * cos(theta) * 5;
        float y = rad * sin(theta) * 5;
        vertex(x,y); 
     }
     endShape();
     
     popMatrix();
}

}
window.onload = function() {

  //Array of Particles
  var num_particles = 5;
  var particles = [];
  var springs = [];

  //Touched point
  var touchedIdx = -1;

  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');

  if (!ctx) {
      return;
  }

  //Store last mouse position
  //We need this to keep the point in place even if mouse move events are not fired
  lastMousePosition = {
    x: 0,
    y: 0
  };

  //Resize the canvas the first time
  resizeCanvas();

  ctx.fillStyle = '#333';
  ctx.strokeStyle = '#DDD';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  var physics = new Physics();

  physics.drag = 0.1;

  var mass = 1;
  var radius = 10;


  //Create particles at random on the canvas
  particles.push(physics.makeParticle(mass, 100, 100));
  particles.push(physics.makeParticle(mass, 50, 150));
  particles.push(physics.makeParticle(mass, 100, 200));
  particles.push(physics.makeParticle(mass, 150, 250));
  particles.push(physics.makeParticle(mass, 200, 200));
  particles.push(physics.makeParticle(mass, 250, 150));
  particles.push(physics.makeParticle(mass, 200, 100));
  particles.push(physics.makeParticle(mass, 150, 50));

  var spring_constant = 0.55; // What is the strength of the bond?
  var damping = 0.5; // How much drag is on the string?

  // var anchor = physics.makeParticle(mass, canvas.width/2, canvas.height/2);
  // anchor.makeFixed();

  // for (var i = 0; i < num_particles; i++) {
  //   physics.makeAttraction(anchor, particles[i], 5000000, canvas.width*2);
  // }

  //Set up springs
  for (var i = 0; i < particles.length-1; i++) {
    springs.push(physics.makeSpring(particles[i], particles[i+1], spring_constant, damping, particles[i].distanceTo(particles[i+1])));
  }
  springs.push(physics.makeSpring(particles[0], particles[particles.length-1], spring_constant, damping, particles[0].distanceTo(particles[particles.length-1])));
  
  particles.push(physics.makeParticle(mass, 150, 150));
  for (var i = particles.length-2; i >= 0; i--) {
    springs.push(physics.makeSpring(particles[particles.length-1], particles[i], spring_constant+0.3  , damping, particles[particles.length-1].distanceTo(particles[i])));
  }
  
  // for (var i = particles.length-2; i >= 0; i++) {
  //   springs.push(physics.makeSpring(particles[particles.length-1], particles[i], spring_constant, damping, particles[particles.length-1].distanceTo(particles[i])));
  // }

  var render = function() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(touchedIdx >= 0) {
      updatePosition(particles[touchedIdx], lastMousePosition);
    }

    for (var i = 0; i < particles.length; i++) {
      // checkScreenEdge(particles[i]);
      ctx.beginPath();
      ctx.arc(particles[i].position.x, particles[i].position.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    //Uncomment to Draw the centre of gravity
    // ctx.fillStyle = '#0AA'
    // ctx.beginPath();
    // ctx.arc(anchor.position.x, anchor.position.y, radius, 0, Math.PI * 2);
    // ctx.fill();
    // ctx.fillStyle = '#333'

    for (var i = 0; i < springs.length; i++) {
      ctx.beginPath();
      ctx.moveTo(springs[i].a.position.x, springs[i].a.position.y);
      ctx.lineTo(springs[i].b.position.x, springs[i].b.position.y);
      ctx.stroke();
    }
  };

  // Bind the render function to when physics updates.
  physics.onUpdate(render);

  // Render a posterframe.
  render();

  physics.toggle();

  // store our physics object on the canvas so we can access it later
  canvas.physics = physics;

  canvas.onmousedown = function(ev) {
    var pointVector = new Physics.Vector(ev.pageX, ev.pageY);
    touchedIdx = checkTouch(pointVector);
  };

  canvas.onmousemove = function(ev) {
    lastMousePosition.x = ev.pageX;
    lastMousePosition.y = ev.pageY;
  };

  canvas.onmouseup = function(ev) {
    if (touchedIdx >= 0) {
      updatePosition(particles[touchedIdx], lastMousePosition);
    }
    touchedIdx = -1;
  };

  canvas.onmouseleave = function (ev) {
    if (touchedIdx >= 0) {
      updatePosition(particles[touchedIdx], lastMousePosition);
    }
    touchedIdx = -1;
  };

  function checkTouch(pointVector) {
    for (var i=0; i < num_particles; i++) {
      //console.log(particles[i].position.distanceTo(ev.center));
      if (particles[i].position.distanceTo(pointVector) < radius) {
        return i;
      }
    }
    return -1;
  }

  function checkScreenEdge(particle) {
    if (particle.position.x <= (0+radius) || particle.position.x >= (canvas.width-radius)) {
      particle.velocity.x *=-1;
    }
    if (particle.position.y <= (0+radius) || particle.position.y >= (canvas.height-radius)) {
      particle.velocity.y *=-1;
    }
  }

  //Updates a particle position to given coordinates
  function updatePosition (particle, mousePos) {
    particle.position.x = mousePos.x;
    particle.position.y = mousePos.y;
  }

}

function resizeCanvas() {
  // Lookup the size the browser is displaying the canvas.
  var displayWidth  = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  if (canvas.width  != displayWidth ||
      canvas.height != displayHeight) {

    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
}
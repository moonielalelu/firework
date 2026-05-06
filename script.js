<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Elegant Fireworks</title>

<style>
html,body{
  margin:0;
  overflow:hidden;
  background:#000;
}

canvas{
  display:block;
}
</style>
</head>
<body>

<canvas id="c"></canvas>

<script>
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);


// =========================
// SOUND
// =========================

const launchSound = new Audio("firework-launch.mp3");
const burstSound = new Audio("firework-burst.mp3");
const crackleSound = new Audio("firework-crackle.mp3");

launchSound.volume = 0.12;
burstSound.volume = 0.20;
crackleSound.volume = 0.08;


// unlock autoplay
addEventListener("pointerdown",()=>{

  launchSound.play().catch(()=>{});
  burstSound.play().catch(()=>{});
  crackleSound.play().catch(()=>{});

},{once:true});


// =========================
// SYSTEM
// =========================

let rockets = [];
let particles = [];

class Particle {

  constructor(
    x,y,
    dx,dy,
    life,
    hue,
    size=2,
    glow=10
  ){

    this.x = x;
    this.y = y;

    this.dx = dx;
    this.dy = dy;

    this.life = life;
    this.maxLife = life;

    this.hue = hue;

    this.size = size;
    this.glow = glow;
  }

  update(){

    this.x += this.dx;
    this.y += this.dy;

    this.dx *= 0.988;
    this.dy *= 0.988;

    this.dy += 0.015;

    this.life--;
  }

  draw(){

    const a = this.life / this.maxLife;

    ctx.beginPath();
    ctx.arc(this.x,this.y,this.size,0,Math.PI*2);

    ctx.fillStyle =
      `hsla(${this.hue},100%,70%,${a})`;

    ctx.shadowBlur = this.glow;
    ctx.shadowColor =
      `hsla(${this.hue},100%,70%,1)`;

    ctx.fill();

    ctx.shadowBlur = 0;
  }
}


class Rocket {

  constructor(){

    this.x =
      Math.random() * canvas.width;

    this.y =
      canvas.height + 20;

    this.target =
      canvas.height *
      (0.15 + Math.random()*0.35);

    // elegant gold range
    this.hue =
      35 + Math.random()*25;

    this.speed =
      6 + Math.random()*2;

    this.trail = [];

    // sound
    const s = launchSound.cloneNode();

    s.volume =
      0.08 + Math.random()*0.05;

    s.play();
  }

  update(){

    this.trail.push({
      x:this.x,
      y:this.y
    });

    if(this.trail.length > 12)
      this.trail.shift();

    this.y -= this.speed;


    // trail
    this.trail.forEach((t,i)=>{

      const a = i / this.trail.length;

      ctx.beginPath();

      ctx.arc(
        t.x,
        t.y,
        1.5 * a,
        0,
        Math.PI*2
      );

      ctx.fillStyle =
        `hsla(${this.hue},100%,75%,${a*0.45})`;

      ctx.fill();
    });


    // rocket core
    ctx.beginPath();

    ctx.arc(
      this.x,
      this.y,
      2.5,
      0,
      Math.PI*2
    );

    ctx.fillStyle = "#fff4d6";

    ctx.shadowBlur = 25;
    ctx.shadowColor = "#ffd37a";

    ctx.fill();

    ctx.shadowBlur = 0;
  }
}


// =========================
// EXPLOSION
// =========================

function explodeElegant(x,y,hue){

  // outer ring
  for(let i=0;i<120;i++){

    const angle =
      (Math.PI*2/120)*i;

    const speed =
      1.5 + Math.random()*3.5;

    particles.push(

      new Particle(
        x,
        y,

        Math.cos(angle)*speed,
        Math.sin(angle)*speed,

        100,

        hue,

        1.8 + Math.random()*1.8,

        14
      )
    );
  }


  // center cloud
  for(let i=0;i<30;i++){

    particles.push(

      new Particle(
        x,
        y,

        (Math.random()-0.5)*2,
        (Math.random()-0.5)*2,

        70,

        hue,

        8 + Math.random()*10,

        35
      )
    );
  }


  // crackle sparks
  for(let i=0;i<40;i++){

    particles.push(

      new Particle(
        x,
        y,

        (Math.random()-0.5)*7,
        (Math.random()-0.5)*7,

        40,

        0,

        Math.random()*1.5,

        4
      )
    );
  }


  // burst sound
  const b = burstSound.cloneNode();
  b.play();


  // delayed crackle
  setTimeout(()=>{

    const c =
      crackleSound.cloneNode();

    c.volume = 0.06;

    c.play();

  },120);
}



// =========================
// ANIMATION
// =========================

function animate(){

  // smooth cinematic fade
  ctx.fillStyle =
    "rgba(0,0,0,0.12)";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  // subtle flash
  if(Math.random() < 0.003){

    ctx.fillStyle =
      "rgba(255,220,160,0.03)";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }


  // launch rockets
  if(Math.random() < 0.08){

    rockets.push(
      new Rocket()
    );
  }


  // update rockets
  rockets = rockets.filter(r=>{

    r.update();

    if(r.y <= r.target){

      explodeElegant(
        r.x,
        r.y,
        r.hue
      );

      return false;
    }

    return true;
  });


  // update particles
  particles = particles.filter(p=>{

    p.update();
    p.draw();

    return p.life > 0;
  });


  requestAnimationFrame(
    animate
  );
}

animate();

</script>
</body>
</html>

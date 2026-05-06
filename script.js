const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();

window.addEventListener(
  "resize",
  resize
);


// ========================================
// AUDIO SYSTEM
// ========================================

const audioCtx = new (
  window.AudioContext ||
  window.webkitAudioContext
)();

addEventListener("pointerdown",()=>{

  audioCtx.resume();

},{once:true});



function playLaunchSound(){

  const osc =
    audioCtx.createOscillator();

  const gain =
    audioCtx.createGain();

  osc.type = "sine";

  osc.frequency.setValueAtTime(
    220,
    audioCtx.currentTime
  );

  osc.frequency.exponentialRampToValueAtTime(
    880,
    audioCtx.currentTime + 0.25
  );

  gain.gain.setValueAtTime(
    0.001,
    audioCtx.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    0.04,
    audioCtx.currentTime + 0.03
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audioCtx.currentTime + 0.28
  );

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(
    audioCtx.currentTime + 0.3
  );
}



function playExplosionSound(){

  const bufferSize =
    audioCtx.sampleRate * 0.6;

  const buffer =
    audioCtx.createBuffer(
      1,
      bufferSize,
      audioCtx.sampleRate
    );

  const data =
    buffer.getChannelData(0);

  for(let i=0;i<bufferSize;i++){

    data[i] =
      (Math.random()*2-1) *
      Math.pow(
        1 - i/bufferSize,
        2.5
      );
  }

  const noise =
    audioCtx.createBufferSource();

  noise.buffer = buffer;

  const lowpass =
    audioCtx.createBiquadFilter();

  lowpass.type = "lowpass";
  lowpass.frequency.value = 900;

  const gain =
    audioCtx.createGain();

  gain.gain.setValueAtTime(
    0.25,
    audioCtx.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audioCtx.currentTime + 0.6
  );

  noise.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(audioCtx.destination);

  noise.start();
}



function playCrackleSound(){

  for(let i=0;i<18;i++){

    const osc =
      audioCtx.createOscillator();

    const gain =
      audioCtx.createGain();

    osc.type = "triangle";

    osc.frequency.value =
      1200 + Math.random()*2500;

    const t =
      audioCtx.currentTime + i*0.012;

    gain.gain.setValueAtTime(
      0.0001,
      t
    );

    gain.gain.exponentialRampToValueAtTime(
      0.015,
      t + 0.002
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      t + 0.03
    );

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.04);
  }
}



// ========================================
// PARTICLES
// ========================================

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

    const a =
      this.life / this.maxLife;

    ctx.beginPath();

    ctx.arc(
      this.x,
      this.y,
      this.size,
      0,
      Math.PI*2
    );

    ctx.fillStyle =
      `hsla(${this.hue},100%,70%,${a})`;

    ctx.shadowBlur =
      this.glow;

    ctx.shadowColor =
      `hsla(${this.hue},100%,70%,1)`;

    ctx.fill();

    ctx.shadowBlur = 0;
  }
}



// ========================================
// ROCKET
// ========================================

class Rocket {

  constructor(){

    this.x =
      Math.random() *
      canvas.width;

    this.y =
      canvas.height + 20;

    this.target =
      canvas.height *
      (0.15 + Math.random()*0.35);

    // elegant gold tones
    this.hue =
      35 + Math.random()*25;

    this.speed =
      6 + Math.random()*2;

    this.trail = [];

    playLaunchSound();
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

      const a =
        i / this.trail.length;

      ctx.beginPath();

      ctx.arc(
        t.x,
        t.y,
        1.5*a,
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

    ctx.fillStyle =
      "#fff4d6";

    ctx.shadowBlur = 25;
    ctx.shadowColor =
      "#ffd37a";

    ctx.fill();

    ctx.shadowBlur = 0;
  }
}



// ========================================
// EXPLOSION
// ========================================

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

  playExplosionSound();

  setTimeout(()=>{

    playCrackleSound();

  },120);
}



// ========================================
// MAIN LOOP
// ========================================

function animate(){

  // cinematic fade
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


  // rockets
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


  // particles
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

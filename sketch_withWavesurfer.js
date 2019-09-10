let player;
let scl = 100;
let scl2 = 50;
let scl4 = 25;
let playButton;
let isTriggered = false;
let counter = 0;
let counterTen;
let loopToggle;
let reverseToggle;
let sliders = []
let rateSlider;
let detuneSlider;
let grainSlider;
let overlapSlider;
let startSlider;
let endSlider;
let rateButtons = [];
let samps = [];
let sampsIndex = 0;
let sampButtons = [];
let reverb;
let delay;
let dropzone;
let sound;
let filter;
let wavesurfer;


function preload() {
  for (let i = 0; i < 5; i++) {
    samps[i] = loadSound('loops/loop' + [i] + '.wav');
  }
}

function setup() {
  frameRate(30);
  createCanvas(1200, 700);
  uxFill(200);
  uxStrokeWeight(4);
  // create player instance and load with sample
  player = new Player();
  player.loadSamp(samps[sampsIndex].url);
  // play and stop buttons
  playButton = uxTriangle(290, 70, 290, 95, 310, 82.5);
  playButton.uxEvent('click', trigger);
  stopButton = uxRect(287.5, 130, scl4, scl4);
  stopButton.uxEvent('press', stopp);
  // Audio parameter sliders
  detuneSlider = new Slider(287.5, 250, scl4, scl4, 120, 480, -1200, 1200, 287.5);
  grainSlider = new Slider(287.5, 300, scl4, scl4, 120, 480, 0.01, 0.5, 287.5);
  overlapSlider = new Slider(287.5, 350, scl4, scl4, 120, 480, 0.01, 0.2, 287.5);
  startSlider = new Slider(137.5, 400, scl4, scl4, 120, 480, 0, samps[sampsIndex].buffer.duration, 287.5);
  endSlider = new Slider(437.5, 450, scl4, scl4, 120, 480, 0, samps[sampsIndex].buffer.duration, 287.5);
  sliders.push(detuneSlider, grainSlider, overlapSlider, startSlider, endSlider);
  // loop and reverse toggles
  loopToggle = uxEllipse(200, 130 + scl4 / 2, scl4, scl4);
  loopToggle.uxEvent('click', toggle);
  reverseToggle = uxEllipse(400, 130 + scl4 / 2, scl4, scl4);
  reverseToggle.uxEvent('click', rev);
  // sample select buttons
  for (i = 0; i < 5; i++) {
    sampButtons[i] = new sampSelector(i * 75 + 138, 500, scl4, scl4);
    sampButtons[i].button.uxEvent('click', changeSamp)
  }
  sampButtons[0].button.uxFill = '#fff';
  // rate select buttons
  for (i = 0; i < 5; i++) {
    rateButtons[i] = new rateSelector(i * 75 + 138, 190, scl4, scl4);
    rateButtons[i].button.uxEvent('click', changeRate)
  }
  rateButtons[2].button.uxFill = '#fff';
  // create fx instances and set default values
  reverb = new Tone.Freeverb();
  delay = new Tone.PingPongDelay();
  filter = new Tone.Filter(1000, 'lowpass');
  // chain player thru fx
  player.player.chain(reverb, delay, filter, Tone.Master);
  // FX sliders
  reverbMixSlider = new Slider(737.5, 200, scl4, scl4, 720, 1080, 0, 1, 887.5);
  reverbTimeSlider = new Slider(737.5, 250, scl4, scl4, 720, 1080, 0, 1, 887.5);
  delayMixSlider = new Slider(737.5, 300, scl4, scl4, 720, 1080, 0, 1, 887.5);
  delayTimeSlider = new Slider(737.5, 350, scl4, scl4, 720, 1080, 0, 1, 887.5);
  delayFeedbackSlider = new Slider(737.5, 400, scl4, scl4, 720, 1080, 0, 0.9, 887.5);
  filterCutoffSlider = new Slider(1037.5, 450, scl4, scl4, 720, 1080, 0, 2000, 887.5);
  filterQSlider = new Slider(737.5, 500, scl4, scl4, 720, 1080, 0.1, 30, 887.5);
  sliders.push(reverbMixSlider, reverbTimeSlider, delayMixSlider, delayTimeSlider, delayFeedbackSlider, filterCutoffSlider, filterQSlider);
  // sample drag and drop
  dropzone = select('#dropzone');
  dropzone.style('color', '#295471');
  dropzone.style('font-size', '24px');
  dropzone.drop(gotFile);

  wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#355D79',
      progressColor: 'purple',
      barWidth: 2,
      barHeight: 1,
      duration: samps[sampsIndex].buffer.duration,
      interact: false,
      cursorWidth: 0
  });
  wavesurfer.load(samps[sampsIndex].url);
  wavesurfer.setMute('mute');
}

function draw() {
  background(200);
  player.settings();
  for (s of sliders) {
    s.show();
    s.mapVals();
  }
  fxSet();
  writeText();
  transport();
  waveLoop();
  // console.log(samps[sampsIndex].buffer.duration);
  console.log(wavesurfer.duration);
}


function writeText(){
  strokeWeight(2);
  fill(255, 40);
  textSize(18);
  textFont('monospace');
  text('sample', 10, 513);
  text('end', 10, 463);
  text('start', 10, 413);
  text('overlap', 10, 363);
  text('size', 10, 313);
  text('pitch', 10, 263);
  text('rate', 10, 213);
  text('filter cutoff', 540, 463);
  text('filter q', 540, 513);
  text('delay feedback', 540, 413);
  text('delay time', 540, 363);
  text('delay mix', 540, 313);
  text('reverb time', 540, 263);
  text('reverb mix', 540, 213);
  textSize(12);
  text('loop', 185, 170);
  text('reverse', 375, 170);
}

function changeRate() {
  for (i = 0; i < rateButtons.length; i++) {
    rateButtons[i].button.uxFill = '#C8C8C8';
  }
  this.uxFill = "#fff";
  if (mouseX < 165) {
    player.rate = 0.25;
  } else if (mouseX < 240) {
    player.rate = 0.5;
  } else if (mouseX < 315) {
    player.rate = 1;
  } else if (mouseX < 390) {
    player.rate = 2;
  } else {
    player.rate = 4;
  }
}

function changeSamp() {
  for (i = 0; i < sampButtons.length; i++) {
    sampButtons[i].button.uxFill = '#C8C8C8';
  }
  this.uxFill = "#fff";
  if (mouseX < 165) {
    sampsIndex = 0;
  } else if (mouseX < 240) {
    sampsIndex = 1;
  } else if (mouseX < 315) {
    sampsIndex = 2;
  } else if (mouseX < 390) {
    sampsIndex = 3;
  } else {
    sampsIndex = 4;
  }
  player.loadSamp(samps[sampsIndex].url);
  startSlider.max = samps[sampsIndex].buffer.duration;
  endSlider.max = samps[sampsIndex].buffer.duration;
  wavesurfer.load(samps[sampsIndex].url);
  wavesurfer.duration = samps[sampsIndex].buffer.duration;
}

function trigger() {
  playButton.uxFill = '#fff';
  player.start();
  setTimeout(function() {
    playButton.uxFill = '#C8C8C8';
  }, 100);
  wavesurfer.play(0,samps[sampsIndex].buffer.duration);
  isTriggered = true;
  counter = 0;
}

function transport() {
  if (isTriggered){
    if (frameCount% 3 === 0){
        counter++;
    }
    counterTen = counter/10;
  }
}


function stopp() {
  stopButton.uxFill = '#fff';
  player.stop();
  wavesurfer.stop()
  setTimeout(function() {
    stopButton.uxFill = '#C8C8C8';
  }, 100);
  isTriggered = false;
  counter = 0;
}

function toggle() {
  if (player.loop === false) {
    loopToggle.uxFill = "#fff";
    player.loop = true;
  } else {
    loopToggle.uxFill = '#C8C8C8';
    player.loop = false;
  }
}

function waveLoop(){
  if(player.loop){
    if(counterTen>=samps[sampsIndex].buffer.duration-0.1){
      counter = 0;
      wavesurfer.play(0,samps[sampsIndex].buffer.duration);
    }
  }
}

function rev() {
  if (player.reverse === false) {
    reverseToggle.uxFill = "#fff";
    player.reverse = true;
  } else {
    reverseToggle.uxFill = '#C8C8C8';
    player.reverse = false;
  }
}

function mouseDragged() {
  for (var s of sliders) {
    let overlap = collidePointRect(mouseX, mouseY, s.x, s.y, s.w, s.h);
    let n = constrain(mouseX, s.xorigin - 150 + s.w / 2, s.xorigin + 150 + s.w / 2);
    if (overlap) {
      s.x = n - s.w / 2;
    }
  }
}

class Slider {
  constructor(x, y, w, h, linex1, linex2, min, max, xorigin) {
    this.x = x;
    this.xorigin = xorigin;
    this.y = y;
    this.w = w;
    this.h = h;
    this.linex1 = linex1;
    this.linex2 = linex2;
    this.m;
    this.min = min;
    this.max = max;
  }

  show() {
    line(this.linex1, this.y + this.h / 2, this.linex2, this.y + this.h / 2)
    strokeWeight(4);
    fill(200);
    rect(this.x, this.y, this.w, this.h)
  }

  mapVals() {
    this.m = map(this.x, this.xorigin - 150, this.xorigin + 150, this.min, this.max).toFixed(2);
  }
}

class Player {
  constructor() {
    this.rate = 1;
    this.detune = 0;
    this.grainSize = 0.2;
    this.overlap = 0.1;
    this.loop = false;
    this.loopStart = 0;
    this.loopEnd = 5;
    this.reverse = false;
    this.player = new Tone.GrainPlayer();
  }

  settings() {
    this.player.playbackRate = this.rate;
    this.player.detune = detuneSlider.m;
    this.player.grainSize = grainSlider.m;
    this.player.overlap = overlapSlider.m
    this.player.loop = this.loop;
    this.player.loopStart = startSlider.m;
    this.player.loopEnd = endSlider.m;
    this.player.reverse = this.reverse;
  }


  start() {
    this.player.start();
  }

  stop() {
    this.player.stop();
  }

  loadSamp(s) {
    this.player.buffer.load(s);
  }
}

class sampSelector {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.button = uxRect(this.x, this.y, this.w, this.h);
  }
}

class rateSelector {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.button = uxRect(this.x, this.y, this.w, this.h);
  }
}

function fxSet() {
  delay.wet.value = delayMixSlider.m;
  delay.delayTime.value = delayTimeSlider.m;
  delay.feedback.value = delayFeedbackSlider.m;
  reverb.wet.value = reverbMixSlider.m;
  reverb.roomSize.value = reverbTimeSlider.m;
  filter.frequency.value = filterCutoffSlider.m;
  filter.Q.value = filterQSlider.m;

}

function gotFile(file) {
  console.log('got file');
  sound = loadSound(file.data, loadIt);
  console.log(sound);
}

function loadIt() {
  player.loadSamp(sound.url);
  startSlider.max = sound.buffer.duration;
  endSlider.max = sound.buffer.duration;
}

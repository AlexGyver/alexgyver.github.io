function setup() {
  createCanvas(600, 600, WEBGL);
  ortho();
  smooth(6);
}
let val = 0.0;
let size = 25;
let amount = 12;
let offset = 1;
let ampli = 110;

function draw() {
  directionalLight(100, 255, 100, -1, 1, 0);
  ambientLight(80, 80, 200);
  //ambient(#fff000);
  
  background(255);  
  translate(-10, -100, 0);
  rotateX(PI/3);
  rotateZ(PI/4);

  for (let i = -amount/2; i < amount/2; i++) {
    for (let j = -amount/2; j < amount/2; j++) {
      translate(size+offset, 0, 0);
      //box(size, size, ampli+size+(sin(val-abs((i-amount/2)*(j-amount/2))*0.05)*ampli));
      box(size, size, ampli + size + sin(val - (i*i+j*j) * 0.04) * ampli);
    }
    translate(-amount*(size+offset), size+offset, 0);
  }

  val+=0.05;
}

let objAmount = 50;      // количество частиц
let objPosX = [];
let objPosY = [];
let objVelX = [];
let objVelY = [];
let objSize = [];
let radius = 130;
let windowW = 600;  // ширина окна
let windowH = 600;  // высота окна
let border = 10;

function setup() {
  createCanvas(800, 800, WEBGL);
  for (let i = 0; i < objAmount; i++) {
    objPosX[i] = random(0, width);
    objPosY[i] = random(0, height);
    objVelX[i] = random(-2, 2);
    objVelY[i] = random(-2, 2);
    objSize[i] = random(4, 10);
  }
}

function draw() {
  translate(-width/2, -height/2);
  fill(255, 180, 0);
  background(20);  // стереть фон  
  noStroke();
  for (let i = 0; i < objAmount; i++) {
    objPosX[i] += objVelX[i];
    objPosY[i] += objVelY[i];
    if (objPosX[i] < 0 || objPosX[i] > width) objVelX[i] *= -1;
    if (objPosY[i] < 0 || objPosY[i] > height) objVelY[i] *= -1;
  }
  
  strokeWeight(1);
  stroke(70, 30, 30);
  for (let i = 0; i < objAmount; i++) {
    for (let j = 0; j < objAmount; j++) {
      if (i != j && dist(objPosX[i], objPosY[i], objPosX[j], objPosY[j]) < radius) {
        line(objPosX[i], objPosY[i], objPosX[j], objPosY[j]);
      }
    }
  }
  noStroke();
  for (let i = 0; i < objAmount; i++) {
    circle(objPosX[i], objPosY[i], objSize[i]);
  }
}

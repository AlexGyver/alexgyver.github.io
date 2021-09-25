let objAmount = 2000;      // количество частиц
let zoneSize = 100;        // домашняя зона частицы
let dangerZoneSize = 10;   // зона заражения частицы
let infectionProb = 40;    // вероятность заражения
let speed = 0.01;       // скорость частиц
let measPeriod = -1;       // продолжительность симуляции (-1 чтобы отключить)
let deadCount = -1;        // смерть заражённого через (-1 чтобы отключить) 
let fps = 300;             // скорость симуляции
let randomMoving = 0;      // случайные перемещения заражённых

let objSize = 5;    // размер частицы
let windowW = 800;  // ширина окна
let windowH = 600;  // высота окна


// разраб
let time = 0;
let infectedAmount = 1;
let deadAmount = 0;
let lastInfectedAmount = 0;
let border = 10;
let minPos = border+objSize/2;
let maxPos = windowH-border-objSize/2;
let counter = 0;
let plotCount = 0;

let objHomeX = [];
let objHomeY = [];
let objPosX = [];
let objPosY = [];
let count = [];
let dead = [];
let infected = [];

let font;

function preload() {
  font = loadFont('assets/SourceSansPro-Regular.otf');
}

function setup() {  
	createCanvas(800, 600, WEBGL);
	frameRate(300);
	smooth(8);
	background('white');
	noStroke();
	infected[0] = true;
	for (let i = 0; i < objAmount; i++) {
		objHomeX[i] = random(border+objSize, windowH-border*2-objSize*2);
		objHomeY[i] = random(border+objSize, windowH-border*2-objSize*2);
	}
	textFont(font);
	textSize(22);
	strokeWeight(3);
}

function draw() { 
	translate(-width/2, -height/2);
	//background('white');  // стереть фон
	stroke('black');  
	fill('white');
	rect(border, border, windowH-border*2, windowH-border*2);  
	noStroke();
	moveObj();
}

function moveObj() {
	counter += speed;
	// движение
	for (let i = 0; i < objAmount; i++) {
		if (randomMoving == 1 && random(12500) == 0) {
			objHomeX[i] = random(border+objSize, windowH-border*2-objSize*2);
			objHomeY[i] = random(border+objSize, windowH-border*2-objSize*2);
		}
		objPosX[i] = objHomeX[i] + ((noise(i*2, counter)-0.5) * zoneSize);
		objPosY[i] = objHomeY[i] + ((noise(i*2+1.0, counter)-0.5) * zoneSize);
		objPosX[i] = constrain(objPosX[i], minPos, maxPos);
		objPosY[i] = constrain(objPosY[i], minPos, maxPos);
	}

	for (let i = 0; i < objAmount; i++) {
		if (!infected[i] || dead[i]) continue;
		for (let j = 0; j < objAmount; j++) {
			if (
					!infected[j] &&
					abs(objPosX[i] - objPosX[j]) < dangerZoneSize &&
					abs(objPosY[i] - objPosY[j]) < dangerZoneSize && 
					round(random(100-infectionProb)) == 0
					) {
				infected[j] = true;
				infectedAmount++;
			}
		}

		if (deadCount > 0) {
			if (++count[i] < deadCount) {
				count[i]++;
			} else {
				dead[i] = true;
				deadAmount++;
			}
		}
	}

	// отрисовка
	fill('gray');
	for (let i = 0; i < objAmount; i++) {
		if (infected[i]) fill('red');
		else fill('gray');
		if (!dead[i]) circle(objPosX[i], objPosY[i], objSize);
	}
	time++;
	if (time % 50 == 0) { 
		//prletln(infectedAmount);    
		stroke('gray');
		line(windowH, 80+plotCount*4, windowH+150*infectedAmount/objAmount, 80+plotCount*4);   
		noStroke();
		plotCount++;
	}

	fill('white');
	rect(windowH, 0, windowH+150, 65);
	fill('gray');
	text("infected:", windowH, 30);
	text(infectedAmount-deadAmount, windowH+80, 30);

	fill('blue');
	text("time:", windowH, 60);
	text(time, windowH+50, 60);

	if (time == measPeriod) for (;;);
	if (infectedAmount == objAmount) for (;;);
}
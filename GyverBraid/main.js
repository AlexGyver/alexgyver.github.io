// CONST
const ui_offs = 250;
const cv_d = 500;
let cv = [
  { x: ui_offs + cv_d / 2 + 50, y: 50 + cv_d / 2 },
  { x: ui_offs + cv_d + 100 + cv_d / 2, y: 50 + cv_d / 2 }
];

// VARS
var ui;
let img = null;
let nodes = [];

let update_f = true;
let node = 0;
let count = 0;
let best = 0;
let running = false;

// =============== SETUP ===============
function setup() {
  createCanvas(ui_offs + cv_d * 2 + 50 * 3, cv_d + 100);
  ui = QuickSettings.create(10, 10, "GyverBraid")
    .addFileChooser("Pick Image", "", "", handleFile)
    .addRange('Width', cv_d - 200, cv_d + 200, cv_d, 1, update)
    .addRange('Offset X', -200, 200, 0, 1, update)
    .addRange('Offset Y', -200, 200, 0, 1, update)
    .addRange('Brightness', -128, 128, 0, 1, update)
    .addRange('Contrast', 0, 5.0, 1.0, 0.1, update)
    .addRange('Node Amount', 50, 255, 100, 1, update)
    .addRange('Max Lines', 0, 2000, 500, 50, update)
    .addRange('Clear W', 1.1, 3.0, 1.1, 0.1, update)
    .addRange('Clear A', 0, 255, 255, 5, update)
    .addButton('Trace', trace)
    .addButton('Stop', stop)
    .addHTML("Status", "Stop")
    .addTextArea("Nodes", "")
    .addTextArea("Nodes B64", "")
    .addButton('Knit!', knit)
    .setWidth(ui_offs - 10);

  imageMode(CENTER);
  ellipseMode(CENTER);

  //noLoop();
}

// =============== MAIN LOOP ===============
function draw() {
  if (update_f) {
    background(255);
    showImage();
    drawCanvas();
    drawNodes();
    update_f = 0;
    setStatus("Stop");
  }
  if (running) tracer();
}

// =============== FUNC ===============
function tracer() {
  setStatus("Running. Lines: " + count);
  for (let i = 0; i < 10; i++) {
    let max = 0;
    best = -1;

    if (count > ui_get('Max Lines')) {
      count
      setStatus("Done! " + count + " lines");
      running = false;
      ui_set("Nodes", nodes);
      nodes.push(ui_get("Node Amount") & 0xff);
      nodes.push(ui_get("Node Amount") >> 8);

      let u8 = new Uint8Array(nodes);
      var decoder = new TextDecoder('utf8');
      ui_set("Nodes B64", btoa(nodes.map(function(v){return String.fromCharCode(v)}).join('')));

      nodes.pop();
      nodes.pop();
      return;
    }

    loadPixels();
    for (let i = 0; i < ui_get("Node Amount"); i++) {
      let res = scanLine(node, i);
      if (res > max) {
        max = res;
        best = i;
      }
    }
    nodes.push(best);
    updatePixels();

    let xy = [get_xy(0, node), get_xy(0, best)];
    stroke(255, 255, 255, color(ui_get('Clear A')));
    strokeWeight(ui_get('Clear W'));
    line(xy[0].x, xy[0].y, xy[1].x, xy[1].y);

    stroke(0);
    strokeWeight(0.5);
    xy = [get_xy(1, node), get_xy(1, best)];
    line(xy[0].x, xy[0].y, xy[1].x, xy[1].y);
    node = best;
    count++;
  }
}

function scanLine(start, end) {
  let xy = [get_xy(0, start), get_xy(0, end)];

  let x0 = xy[0].x;
  let y0 = xy[0].y;
  let x1 = xy[1].x;
  let y1 = xy[1].y;

  let sum = 0;
  let sx = (x0 < x1) ? 1 : -1;
  let sy = (y0 < y1) ? 1 : -1;
  let dx = abs(x1 - x0);
  let dy = abs(y1 - y0);
  let err = dx - dy;
  let e2 = 0;

  while (1) {
    let i = (x0 + y0 * width) * 4;
    sum += 255 - pixels[i];

    if (x0 == x1 && y0 == y1) break;
    e2 = err * 2;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
  return Math.round(sum);
}

function showImage() {
  if (img) {
    let img_x = cv[0].x + ui_get("Offset X");
    let img_y = cv[0].y + ui_get("Offset Y");
    let show = createImage(img.width, img.height);
    show.copy(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
    show.filter(GRAY);
    show.resize(ui_get("Width"), 0);
    b_and_c(show, ui_get("Brightness"), ui_get("Contrast"));
    //image(show, img_x, img_y, show.width, show.height);
    copy(show, 0, 0, show.width, show.height, img_x - show.width / 2, img_y - show.width / 2, show.width, show.height);
  }
}

function drawCanvas() {
  stroke(0);
  strokeWeight(1);
  noFill();
  circle(cv[0].x, cv[0].y, cv_d + 3);
  circle(cv[1].x, cv[1].y, cv_d);
}
function drawNodes() {
  noStroke();
  fill(0);
  for (let i = 0; i < ui_get("Node Amount"); i++) {
    xy = get_xy(1, i);
    circle(xy.x, xy.y, 5);
  }
}

// =============== FUNC ===============
function get_xy(num, node) {
  let amount = ui_get("Node Amount");
  x = cv[num].x + cv_d / 2 * Math.cos(2 * Math.PI * node / amount);
  y = cv[num].y + cv_d / 2 * Math.sin(2 * Math.PI * node / amount);
  x = Math.round(x);
  y = Math.round(y);
  return { x, y };
}

// =============== HANDLERS ===============
function update() {
  update_f = true;
  running = false;
}
function trace() {
  node = 0;
  count = 1;
  nodes = [0];
  update_f = true;
  running = true;
}
function stop() {
  running = false;
}
function handleFile(file) {
  img = loadImage(URL.createObjectURL(file));
  update();
}
function knit() {
  window.open("http://127.0.0.1:5500/knitter.html?"+ui_get("Nodes B64"), '_blank').focus();
}

// =============== UTILITY ===============
function setStatus(stat) {
  ui_set("Status", stat);
}
function ui_get(name) {
  return ui.getValue(name);
}
function ui_set(name, value) {
  return ui.setValue(name, value);
}
function b_and_c(input, bright, cont) {
  let w = input.width;
  let h = input.height;

  input.loadPixels();
  for (let i = 0; i < w * h * 4; i += 4) {

    let r = input.pixels[i];
    let g = input.pixels[i + 1];
    let b = input.pixels[i + 2];

    r = (r * cont + bright);
    g = (g * cont + bright);
    b = (b * cont + bright);

    r = r < 0 ? 0 : r > 255 ? 255 : r;
    g = g < 0 ? 0 : g > 255 ? 255 : g;
    b = b < 0 ? 0 : b > 255 ? 255 : b;

    input.pixels[i] = r;
    input.pixels[i + 1] = g;
    input.pixels[i + 2] = b;
  }
  input.updatePixels();
}

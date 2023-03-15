// CONST
const ui_offs = 250;
let cv_d = 600;

// VARS
let cv = [
  { x: ui_offs + cv_d / 2 + 50, y: 50 + cv_d / 2 },
  { x: ui_offs + cv_d + 100 + cv_d / 2, y: 50 + cv_d / 2 }
];
var ui;
let img = null;
let nodes = [];
let overlaps = []
let length;

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
    //.addRange('Canvas', 300, 700, 500, 50, resize)
    .addRange('Width', /*cv_d - 200*/0, cv_d + 200, cv_d, 1, update)
    .addRange('Offset X', -cv_d / 2, cv_d / 2, 0, 1, update)
    .addRange('Offset Y', -cv_d / 2, cv_d / 2, 0, 1, update)
    .addRange('Brightness', -128, 128, 0, 1, update)
    .addRange('Contrast', 0, 5.0, 1.0, 0.1, update)
    .addRange('Node Amount', 100, 255, 200, 5, update)
    .addRange('Max Lines', 0, 2000, 500, 50, update)
    .addRange('Diameter', 0, 100, 30, 1, update)
    .addRange('Thickness', 0.1, 1.0, 0.5, 0.1, update)
    .addRange('Clear W', 0.5, 3.0, 1.1, 0.1, update)
    .addRange('Clear A', 0, 255, 200, 5, update)
    .addRange('Offset', 0, 180, 45, 5, update)
    .addRange('Overlaps', 0, 30, 30, 1, update)
    //.addButton('Start', start)
    .addHTML("Control",
      "<button class='qs_button' onclick='start()'>Start</button>&nbsp;" +
      "<button class='qs_button' onclick='stop()'>Stop</button>&nbsp;" +
      "<button class='qs_button' onclick='template()'>Template</button>"
      )
    .addHTML("Status", "Stop")
    .addText("Nodes", "")
    .addText("Nodes B64", "")
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

// =============== TRACER ===============
function tracer() {
  setStatus("Running. Lines: " + count);
  let amount = ui_get("Node Amount");
  for (let i = 0; i < 10; i++) {
    let max = 0;
    best = -1;

    loadPixels();
    for (let i = 0; i < amount; i++) {
      let dst = abs(i - nodes[count - 1]);
      if (dst > amount / 2) dst = amount - dst;
      if (dst < 10) continue;

      if (count >= 2) {
        dst = abs(i - nodes[count - 2]);
        if (dst > amount / 2) dst = amount - dst;
        dst = dst / amount * 360;
        if (dst < ui_get("Offset")) continue;
      }

      if (overlaps[i] + 1 > ui_get("Overlaps")) continue;

      let res = scanLine(node, i);
      if (res > max) {
        max = res;
        best = i;
      }
    }

    overlaps[best]++;

    if (count > ui_get('Max Lines') || best < 0) {
      running = false;
      count--;
      setStatus("Done! " + count + " lines, " + Math.round(length / 100) + " m");

      ui_set("Nodes", nodes);
      nodes.push(amount & 0xff);
      nodes.push((amount >> 8) & 0xff);

      let u8 = new Uint8Array(nodes);
      var decoder = new TextDecoder('utf8');
      //ui_set("Nodes B64", btoa(nodes.map(function (v) { return String.fromCharCode(v) }).join('')));
      ui_set("Nodes B64", btoa(String.fromCharCode.apply(null, new Uint8Array(nodes))));
      nodes.pop();
      nodes.pop();
      return;
    }


    nodes.push(best);
    updatePixels();

    let xy = [get_xy(0, node), get_xy(0, best)];
    stroke(255, 255, 255, ui_get('Clear A'));
    strokeWeight(ui_get('Clear W'));
    line(xy[0].x, xy[0].y, xy[1].x, xy[1].y);

    stroke(0, 0, 0, 150);
    strokeWeight(ui_get("Thickness") / ((ui_get("Diameter") * 10 / cv_d)));

    xy = [get_xy(1, node), get_xy(1, best)];
    line(xy[0].x, xy[0].y, xy[1].x, xy[1].y);
    length += dist(xy[0].x, xy[0].y, xy[1].x, xy[1].y) * ui_get("Diameter") / (cv_d);
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
  let len = 0;

  while (1) {
    let i = (x0 + y0 * width) * 4;
    sum += 255 - pixels[i];
    len++;

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

// =============== MISC ===============
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
/*function resize(val) {
  cv_d = val;
  cv = [
    { x: ui_offs + cv_d / 2 + 50, y: 50 + cv_d / 2 },
    { x: ui_offs + cv_d + 100 + cv_d / 2, y: 50 + cv_d / 2 }
  ];
  update_f = true;
}*/
function start() {
  node = 0;
  count = 1;
  nodes = [0];
  overlaps = new Array(ui_get("Node Amount")).fill(0);
  length = 0;
  update_f = true;
  running = true;
}
function stop() {
  running = false;
  update_f = true;
}
function handleFile(file) {
  img = loadImage(URL.createObjectURL(file));
  update();
  ui_set('Offset X', 0);
  ui_set('Offset Y', 0);
  ui_set('Brightness', 0);
  ui_set('Contrast', 1);
}
function knit() {
  window.open(document.location.toString().replace("index.html", "knitter.html?") + ui_get("Nodes B64"), '_blank').focus();
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

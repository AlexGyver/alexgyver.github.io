// GyverBraid Core

// Огромное спасибо:
// copych
// alfedukovich
// cybernetlab

// CONST
const ui_offs = 250;
let cv_d = 650;

// VARS
let cv = [
  { x: ui_offs + cv_d / 2 + 50, y: 50 + cv_d / 2 },
  { x: ui_offs + cv_d + 100 + cv_d / 2, y: 50 + cv_d / 2 }
];
let ui;
let img = null;
let nodes = [];
let overlaps = [];
let length;
let density = 1;

let update_f = true;
let node = 0;
let count = 0;
let best = 0;
let running = false;
let stop_f = false;
let costyl = 0;
let hold_f = false;

let start_x, start_y;
let offs_x = 0, offs_y = 0;
let offs_bx = 0, offs_by = 0;

// =============== SETUP ===============
function setup() {
  //createCanvas(ui_offs + cv_d * 2 + 50 * 3, cv_d + 100);
  // auto zoom
  let cWidth = ui_offs + cv_d * 2 + 50 * 3;
  let cHeight = cv_d + 100;
  document.body.style.zoom = (Math.min((innerHeight - 25) / cHeight, (innerWidth - 25) / cWidth)).toFixed(1);
  createCanvas(cWidth, cHeight);

  ui = QuickSettings.create(0, 0, "GyverBraid v1.2")
    .addFileChooser("Pick Image", "", "", handleFile)
    .addRange('Size', cv_d - 300, cv_d + 500, cv_d, 1, update_h)
    .addRange('Brightness', -128, 128, 0, 1, update_h)
    .addRange('Contrast', 0, 5.0, 1.0, 0.1, update_h)
    .addBoolean('Edges', 0, update_h)

    .addNumber('Diameter', 10, 100, 30, 0.1, update_h)
    .addRange('Thickness', 0.1, 1.0, 0.5, 0.1, update_h)
    .addRange('Node Amount', 100, 255, 200, 5, update_h)

    .addRange('Max Lines', 0, 5000, 1500, 50, update_h)
    .addRange('Threshold', 0, 2000, 0, 0, update_h)

    .addRange('Clear Width', 0.5, 5, 3, 0.5, update_h)
    .addRange('Clear Alpha', 0, 255, 20, 5, update_h)
    .addBoolean('Subtract', 1, update_h)
    .addRange('Offset', 0, 100, 10, 5, update_h)
    .addRange('Overlaps', 0, 15, 0, 1, update_h)
    .addBoolean('Negative', 0, update_h)
    .addBoolean('Center Balance', 0, update_h)
    .addBoolean('Quarter', 0, update_h)
    .addHTML("Control",
      "<button class='qs_button' onclick='start()'>Start</button>&nbsp;" +
      "<button class='qs_button' onclick='stop()'>Stop</button>&nbsp;" +
      "<button class='qs_button' onclick='template()'>Print</button>&nbsp;" +
      "<button class='qs_button' onclick='knit()'>Knit</button>&nbsp;" +
      "<button class='qs_button' onclick='svg()'>SVG</button>"
    )
    .addHTML("Status", "Stop")
    .addText("Nodes", "")
    .addText("Nodes B64", "")
    .setWidth(ui_offs - 10)
    .setDraggable(false)
    .setCollapsible(false);

  //ui.hideControl('Thickness');
  ui.hideControl('Edges');
  ui.hideControl('Threshold');
  ui.hideControl('Subtract');

  density = pixelDensity();

  imageMode(CENTER);
  ellipseMode(CENTER);
}

// =============== MAIN LOOP ===============
function draw() {
  if (update_f || costyl > 0 || hold_f) {
    if (costyl > 0) costyl--;
    if (hold_f) {
      offs_x = offs_bx + mouseX - start_x;
      offs_y = offs_by + mouseY - start_y;
    }
    background(255);
    showImage();
    cropImage();
    drawCanvas();

    drawNodes();
    update_f = 0;
    setStatus("Stop");
  }
  if (running) tracer();

  cursor(ARROW);
  if (inCanvas()) cursor(HAND);
  if (hold_f) cursor('grab');
}

// =============== TRACER ===============
function tracer() {
  setStatus("Running. Lines: " + count);
  let amount = ui_get("Node Amount");
  for (let i = 0; i < 10; i++) {
    let max = -10000000000;
    best = -1;

    loadPixels();

    for (let i = 1; i < amount; i++) {
      let dst = abs(i - nodes[count - 1]);
      if (dst > amount / 2) dst = amount - dst;
      if (dst < 10) continue;

      if (count >= 2) {
        dst = abs(i - nodes[count - 2]);
        if (dst > amount / 2) dst = amount - dst;
        dst = dst / amount * 360;
        if (dst < ui_get("Offset")) continue;

        if (ui_get("Quarter")) {
          const delta = abs(node - i)
          const len = min(amount - delta, delta)
          if (len <= amount / 8) {
            continue;
          }
        }
      }

      if (ui_get("Overlaps") > 0 && overlaps[i] + 1 > ui_get("Overlaps")) continue;
      let res = scanLine(node, i);

      if (res > max) {
        max = res;
        best = i;
      }
    }

    overlaps[best]++;

    if (count > ui_get('Max Lines') || best < 0 || /*max < ui_get('Threshold') || */stop_f) {
      running = false;
      count--;
      setStatus("Done! " + count + " lines, " + Math.round(length / 100) + " m");

      ui_set("Nodes", nodes);
      nodes.push(amount & 0xff);

      let u8 = new Uint8Array(nodes);
      var decoder = new TextDecoder('utf8');
      //ui_set("Nodes B64", btoa(nodes.map(function (v) { return String.fromCharCode(v) }).join('')));
      ui_set("Nodes B64", btoa(String.fromCharCode.apply(null, new Uint8Array(nodes))));
      nodes.pop();
      return;
    }

    nodes.push(best);

    let xy = [get_xy(0, node), get_xy(0, best)];

    if (!ui_get('Subtract')) {
      updatePixels();
      stroke(255, 255, 255, ui_get('Clear Alpha'));
      strokeWeight(ui_get('Clear Width'));
      line(xy[0].x, xy[0].y, xy[1].x, xy[1].y);
    } else {
      clearLine(xy, ui_get('Clear Width'), ui_get('Clear Alpha'));
      updatePixels();
    }

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
    let i = getPixelIndex(x0, y0);
    let val;

    if (ui_get('Negative')) {
      val = (255 - pixels[i]) - (255 - pixels[i + 3]);
    } else {
      val = 255 - pixels[i];
    }

    if (ui_get('Center Balance')) {
      let cx = abs(cv[0].x - x0);
      let cy = abs(cv[0].y - y0);
      let cl = Math.sqrt(cx * cx + cy * cy);
      val *= Math.log(cv_d / 2 / cl);
    }

    sum += val;

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
  sum /= len;
  return Math.round(sum);
}
function clearLine(xy, w, a) {
  for (let i = 0; i < w; i++) {
    let x0 = xy[0].x;
    let y0 = xy[0].y;
    let x1 = xy[1].x;
    let y1 = xy[1].y;

    let lx = abs(x0 - x1);
    let ly = abs(y0 - y1);
    let w2 = Math.round(w / 2);

    if (lx < ly) {
      x0 = x0 - w2 + i;
      x1 = x1 - w2 + i;
    } else {
      y0 = y0 - w2 + i;
      y1 = y1 - w2 + i;
    }

    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let dx = abs(x1 - x0);
    let dy = abs(y1 - y0);
    let err = dx - dy;
    let e2 = 0;

    while (1) {
      let i = getPixelIndex(x0, y0);

      if (ui_get('Negative')) {
        if (pixels[i] + a < 255) {
          pixels[i] += a;
          pixels[i + 1] += a;
          pixels[i + 2] += a;
        } else {
          const ra = a - (255 - pixels[i]);
          pixels[i] = 255;
          pixels[i + 1] = 255;
          pixels[i + 2] = 255;
          pixels[i + 3] -= ra;
          if (pixels[i + 3] < 0) {
            pixels[i + 3] = 0;
          }
        }
      } else {
        pixels[i] += a;
        pixels[i + 1] += a;
        pixels[i + 2] += a;
      }

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
  }
}

// =============== MISC ===============
function cropImage() {
  noStroke();
  fill(255);
  rect(0, 0, width, 50 - 5);
  rect(0, 0, cv[0].x - cv_d / 2 - 5, width);
  rect(0, cv[0].y + cv_d / 2 + 5, width, height);
  rect(cv[0].x + cv_d / 2 + 5, 0, width, height);
}
function showImage() {
  if (img) {
    let img_x = cv[0].x + offs_x;
    let img_y = cv[0].y + offs_y;
    let show = createImage(img.width, img.height);
    show.copy(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
    show.filter(GRAY);
    show.resize(ui_get("Size"), 0);
    b_and_c(show, ui_get("Brightness"), ui_get("Contrast"));
    //if (ui_get('Edges') && !hold_f) edges(show);
    //image(show, img_x, img_y, show.width, show.height);
    copy(show, 0, 0, show.width, show.height, img_x - show.width / 2, img_y - show.width / 2, show.width, show.height);
  }
}
function drawCanvas() {
  stroke(0);
  strokeWeight(1);
  noFill();
  circle(cv[0].x, cv[0].y, cv_d + 7);
  circle(cv[1].x, cv[1].y, cv_d);
}
function drawNodes() {
  noStroke();
  fill(0);
  for (let i = 0; i < ui_get("Node Amount"); i++) {
    xy = get_xy(1, i);
    circle(xy.x, xy.y, 5);

    //xy = get_xy(0, i);
    //circle(xy.x, xy.y, 5);
  }
}
function get_xy(num, node) {
  let xy = get_xy_raw(cv[num].x, cv[num].y, cv_d / 2, node, ui_get("Node Amount"));
  return xy;
}
function get_xy_raw(x, y, r, cur, max) {
  x = x + r * Math.cos(2 * Math.PI * cur / max);
  y = y + r * Math.sin(2 * Math.PI * cur / max);
  x = Math.round(x);
  y = Math.round(y);
  return { x, y };
}
function inCanvas() {
  let vx = mouseX - cv[0].x;
  let vy = mouseY - cv[0].y;
  return (vx * vx + vy * vy < cv_d * cv_d / 4);
}
function mousePressed() {
  if (inCanvas()) {
    hold_f = true;
    offs_bx = offs_x;
    offs_by = offs_y;
    start_x = mouseX;
    start_y = mouseY;
  }
}
function mouseReleased() {
  if (hold_f) {
    hold_f = false;
    offs_x = offs_bx + mouseX - start_x;
    offs_y = offs_by + mouseY - start_y;
    update_f = true;
  }
}
function mouseWheel(event) {
  if (inCanvas()) {
    update_f = true;
    ui_set('Size', ui_get('Size') - event.delta / 5);
  }
}

// =============== HANDLERS ===============
function update_h() {
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
  stop_f = false;
}
function stop() {
  if (!running) update_f = true;
  stop_f = true;
}
function handleFile(file) {
  img = loadImage(URL.createObjectURL(file));
  if (!file.type.toString().includes('image')) {
    img = null;
    return;
  }
  stop_f = true;
  update_h();
  ui_set('Brightness', 0);
  ui_set('Contrast', 1);
  ui_set('Size', 700);
  costyl = 8;
  offs_x = offs_bx = 0;
  offs_y = offs_by = 0;
}
function knit() {
  let s = document.location.toString();
  if (s.indexOf("index.html") > 0) s = s.replace("index.html", "");
  s += "knitter.html?" + ui_get("Nodes B64");
  window.open(s, '_blank').focus();
}
function template() {
  const offs = 100;
  const ratio = 3.778;
  let size = Math.round(ui_get('Diameter') * 10 * ratio) + offs * 2;


  let pg = createGraphics(size, size);
  pg.background(255);
  pg.textSize(17);
  let D = (ui_get('Diameter') * (size / (size - offs * 2))).toFixed(2);
  let y = 0;
  pg.text('Diameter = ' + ui_get('Diameter') + ' cm', 20, y += 25);
  pg.text('Print size = ' + D + 'x' + D + ' cm', 20, y += 25);

  pg.fill(0);
  pg.textAlign(CENTER, CENTER);
  //pg.textFont('Trebuchet MS');
  let am = ui_get('Node Amount');

  pg.stroke(0);
  pg.line(size / 2 - 80, size / 2, size / 2 + 80, size / 2);
  pg.line(size / 2, size / 2 - 80, size / 2, size / 2 + 80);

  for (let i = 0; i < am; i++) {
    /*let xy = get_xy_raw(size / 2, size / 2, size / 2 - 100, i, am);
    pg.noStroke();
    pg.circle(xy.x, xy.y, 10);
    pg.stroke(0);
    let xy0 = get_xy_raw(size / 2, size / 2, size / 2 - 150, i, am);
    let xy1 = get_xy_raw(size / 2, size / 2, size / 2 - 55, i, am);
    pg.line(xy0.x, xy0.y, xy1.x, xy1.y);*/

    let xy = get_xy_raw(size / 2, size / 2, size / 2 - offs, i, am);
    pg.noStroke();
    pg.circle(xy.x, xy.y, 6);
    pg.stroke(0);

    if (i % 10 == 0) {
      //pg.textStyle(BOLD);
      pg.textSize(25);
      xy = get_xy_raw(size / 2, size / 2, size / 2 - 20, i, am);
      pg.text(i, xy.x, xy.y);

      let xy0 = get_xy_raw(size / 2, size / 2, size / 2 - offs, i, am);
      let xy1 = get_xy_raw(size / 2, size / 2, size / 2 - 40, i, am);
      pg.line(xy0.x, xy0.y, xy1.x, xy1.y);
    } else {
      //pg.textStyle(NORMAL);
      pg.textSize(15);
      xy = get_xy_raw(size / 2, size / 2, size / 2 - 45, i, am);
      pg.text(i % 10, xy.x, xy.y);

      let xy0 = get_xy_raw(size / 2, size / 2, size / 2 - offs, i, am);
      let xy1 = get_xy_raw(size / 2, size / 2, size / 2 - 55, i, am);
      pg.line(xy0.x, xy0.y, xy1.x, xy1.y);
    }

  }

  /*for (let i = 0; i < am; i++) {
    pg.push();
    if (i % 10 == 0) {
      pg.textStyle(BOLD);
      pg.textSize(24);
    } else {
      pg.textStyle(NORMAL);
      pg.textSize(20);
    }
    pg.translate(size / 2, size / 2);
    if (i < am / 4 || i > am * 3 / 4) {
      pg.rotate(radians(360 * i / am));
      pg.text(i, size / 2 - 30, 0);
    } else {
      pg.rotate(radians(360 * i / am + 180));
      pg.text(i, -(size / 2 - 30), 0);
    }
    pg.pop();
  }*/
  //image(pg, 0, 0);
  save(pg, "template.png");
}
function svg() {
  let s = document.location.toString();
  if (s.indexOf("index.html") > 0) s = s.replace("index.html", "");
  s += "svg.html?" + ui_get("Nodes B64");
  window.open(s, '_blank').focus();
}

// =============== UTILITY ===============
function getPixelIndex(x, y) {
  return Math.round((x + y * width * density) * 4 * density);
}
function edges(eimg) {
  let kernel = [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]];
  eimg.loadPixels();
  let arr = [];
  for (let i = 0; i < eimg.width * eimg.height; i++) {
    arr.push(eimg.pixels[i * 4]);
  }

  for (let x = 1; x < eimg.width - 1; x++) {
    for (let y = 1; y < eimg.height - 1; y++) {
      let sum = 0;

      for (kx = -1; kx <= 1; kx++) {
        for (ky = -1; ky <= 1; ky++) {
          let xpos = x + kx;
          let ypos = y + ky;

          //let idx = (xpos + ypos * eimg.width) * 4;
          //let val = eimg.pixels[idx];
          let val = red(eimg.get(xpos, ypos));

          //let val = arr[(xpos + ypos * eimg.width)];
          sum += kernel[ky + 1][kx + 1] * val;
        }
      }
      //sum = constrain(sum, 0, 255);
      //arr[(x + y * eimg.width)] = sum;
      //let idx = (x + y * eimg.width) * 4;
      //eimg.pixels[idx] = sum;
      //eimg.pixels[idx+1] = sum;
      //eimg.pixels[idx+2] = sum;

      eimg.set(x, y, color(sum, sum, sum));
    }
  }
  for (let i = 0; i < eimg.width * eimg.height; i++) {
    eimg.pixels[i * 4] = arr[i];
    eimg.pixels[i * 4 + 1] = arr[i];
    eimg.pixels[i * 4 + 2] = arr[i];
  }

  eimg.updatePixels();
}
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
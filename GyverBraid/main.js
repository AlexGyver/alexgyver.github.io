/*global createCanvas, createCanvas, imageMode, CENTER, ellipseMode,
mouseX, mouseY, background, cursor, ARROW, HAND, loadImage */

import { useUI } from './modules/ui.js';
import { useUtils } from './modules/utils.js';
import { useTracer } from './modules/tracer.js';

// GyverBraid Core

// Огромное спасибо:
// copych
// alfedukovich
// cybernetlab

// CONST
const ui_offs = 250;
const cv_d = 650;

// VARS
let cv;
let ui;
let utils;
let tracer;

let img = null;

let update_f = true;
let running = false;
let stop_f = false;
let costyl = 0;
let hold_f = false;

let start_x, start_y;
let offs_x = 0, offs_y = 0;
let offs_bx = 0, offs_by = 0;

// =============== SETUP ===============
export function setup() {
  //createCanvas(ui_offs + cv_d * 2 + 50 * 3, cv_d + 100);
  // auto zoom
  let cWidth = ui_offs + cv_d * 2 + 50 * 3;
  let cHeight = cv_d + 100;
  document.body.style.zoom = (Math.min((innerHeight - 25) / cHeight, (innerWidth - 25) / cWidth)).toFixed(1);
  createCanvas(cWidth, cHeight);

  ui = useUI({
    width: ui_offs - 10,
    props: { // override defaults
      Size: { params: [cv_d - 300, cv_d + 500, cv_d, 1] },
      Thickness: 0.2,
      'Clear Width': 1.5
    },
    onFile: handleFile,
    onUpdate: update_h,
  });
  utils = useUtils(ui, cv_d, ui_offs);
  cv = utils.cv;
  tracer = useTracer(ui, utils);

  //ui.hideControl('Thickness');
  ui.hideControl('Edges');
  ui.hideControl('Threshold');

  imageMode(CENTER);
  ellipseMode(CENTER);
}

// =============== MAIN LOOP ===============
export function draw() {
  if (update_f || costyl > 0 || hold_f) {
    if (costyl > 0) costyl--;
    if (hold_f) {
      offs_x = offs_bx + mouseX - start_x;
      offs_y = offs_by + mouseY - start_y;
    }
    background(255);
    utils.showImage(img, offs_x, offs_y);
    utils.cropImage();
    utils.drawCanvas();

    utils.drawNodes();
    update_f = 0;
    ui.Status = 'Stop';
  }
  running = running && tracer.run(20, stop_f);

  cursor(ARROW);
  if (inCanvas()) cursor(HAND);
  if (hold_f) cursor('grab');
}

// =============== MISC ===============
function inCanvas() {
  const vx = mouseX - cv.circles[0].x;
  const vy = mouseY - cv.circles[0].y;
  return (vx * vx + vy * vy < cv.diameter * cv.diameter / 4);
}
export function mousePressed() {
  if (inCanvas()) {
    hold_f = true;
    offs_bx = offs_x;
    offs_by = offs_y;
    start_x = mouseX;
    start_y = mouseY;
  }
}
export function mouseReleased() {
  if (hold_f) {
    hold_f = false;
    offs_x = offs_bx + mouseX - start_x;
    offs_y = offs_by + mouseY - start_y;
    update_f = true;
  }
}
export function mouseWheel(event) {
  if (inCanvas()) {
    update_f = true;
    ui.Size = ui.Size - event.delta / 5;
  }
}

// =============== HANDLERS ===============
function update_h() {
  update_f = true;
  running = false;
}
/*function resize(val) {
  cv = {
    diameter: cv_d
    circles: [
      { x: ui_offs + cv_d / 2 + 50, y: 50 + cv_d / 2 },
      { x: ui_offs + cv_d + 100 + cv_d / 2, y: 50 + cv_d / 2 }
    ]
  }
  cv = [
    { x: ui_offs + cv_d / 2 + 50, y: 50 + cv_d / 2 },
    { x: ui_offs + cv_d + 100 + cv_d / 2, y: 50 + cv_d / 2 }
  ];
  update_f = true;
}*/
export function start() {
  update_f = true;
  running = true;
  stop_f = false;
  tracer.reset();
}
export function stop() {
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
  ui.Brightness = 0;
  ui.Contrast = 1;
  ui.Size = 700;
  costyl = 8;
  offs_x = offs_bx = 0;
  offs_y = offs_by = 0;
}
export const template = () => utils.template();
export function knit() {
  let s = document.location.toString();
  if (s.indexOf('index.html') > 0) s = s.replace('index.html', '');
  s += 'knitter.html?' + ui['Nodes B64'];
  window.open(s, '_blank').focus();
}
export function svg() {
  let s = document.location.toString();
  if (s.indexOf('index.html') > 0) s = s.replace('index.html', '');
  s += 'svg.html?' + ui['Nodes B64'];
  window.open(s, '_blank').focus();
}


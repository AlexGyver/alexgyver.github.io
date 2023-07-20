// =============== VARS ===============
const cv_offs = 280;
const ui_padd = 20;
let cv_w = 590;
let cv_h = 440;

let ui;
let update_f = true, hold_f = false, run_f = false;

// =============== OFFSET ===============
class Offset {
  start_x = 0;
  start_y = 0;
  offs_x = 0;
  offs_y = 0;
  offs_bx = 0;
  offs_by = 0;

  update(x, y) {
    this.offs_x = this.offs_bx + x - this.start_x;
    this.offs_y = this.offs_by + y - this.start_y;
  }
  begin(x, y) {
    this.offs_bx = this.offs_x;
    this.offs_by = this.offs_y;
    this.start_x = x;
    this.start_y = y;
  }
  end(x, y) {
    this.offs_x = this.offs_bx + x - this.start_x;
    this.offs_y = this.offs_by + y - this.start_y;
  }
  reset() {
    this.offs_x = 0;
    this.offs_bx = 0;
    this.offs_y = 0;
    this.offs_by = 0;
  }
}

// =============== CV OFFSET ===============
function pointOffs(x, y) {
  point(cv_offs + x, cv_h + ui_padd * 2 + y);
}
function lineOffs(x0, y0, x1, y1) {
  line(cv_offs + x0, cv_h + ui_padd * 2 + y0, cv_offs + x1, cv_h + ui_padd * 2 + y1);
}

// =============== UI ===============
function ui_init() {
  if (localStorage.hasOwnProperty('cv_w')) cv_w = Number(localStorage.getItem('cv_w'));
  if (localStorage.hasOwnProperty('cv_h')) cv_h = Number(localStorage.getItem('cv_h'));

  ui = QuickSettings.create(0, 0, "MagicGyver v1.0")
    .addFileChooser("Pick Image", "", "", handleFile)
    .addRange('Width', 0, 900, cv_w, 10, resize_h)
    .addRange('Height', 0, 700, cv_h, 10, resize_h)

    .addHTML("EDITOR", "")
    .addRange('Size', 300, cv_w + 500, cv_w, 1, update_h)
    .addRange('Brightness', -128, 128, 0, 1, update_h)
    .addRange('Contrast', 0, 5.0, 1.0, 0.1, update_h)
    .addRange('Gamma', 1.0, 1.2, 0.0, 0.005, update_h)
    .addRange('Blur', 0, 8, 0, 0.1, update_h)
    //.addRange('Poster', 1, 10, 1, 1, update_h)
    .addRange('Threshold', 0.0, 1.0, 0.5, 0.05, update_h)
    .addDropDown('Edges', ['None', 'Median', 'Sobel'], update_h)
    .addHTML("TRACER", "")
    .addDropDown('Trace', ['Crawl', 'Waves'], select_h)
    .addRange('Row amount', 0, 50, 20, 1, update_h)
    .addRange('Amplitude', 0, 3, 1, 0.1, update_h)
    .addBoolean('Loop', 1, update_h)
    .addRange('Skip', 1, 10, 5, 1, update_h)

    .addHTML("Status", "Idle")
    .addBoolean('Autostart', 1, update_h)
    .addHTML("Control",
      "<button class='qs_button' onclick='start()'>Start</button>&nbsp;" +
      "<button class='qs_button' onclick='stop()'>Stop</button>&nbsp;" +
      "<button class='qs_button' onclick='save_h()'>Save</button>&nbsp;" +
      "<button class='qs_button' onclick='window.open(\"/viewer.html\", \"_blank\").focus()'>Viewer</button>")

    .setWidth(cv_offs - ui_padd)
    .setDraggable(false)
    .setCollapsible(false);
}

function select_h() {
  ui.hideControl('Amplitude');
  ui.hideControl('Row amount');
  ui.hideControl('Loop');
  ui.hideControl('Skip');

  switch (ui_get('Trace').label) {
    case 'Waves':
      ui.showControl('Row amount');
      ui.showControl('Amplitude');
      break;
    case 'Crawl':
      ui.showControl('Loop');
      ui.showControl('Skip');
      break;
  }
  update_h();
}

function ui_get(name) {
  return ui.getValue(name);
}
function ui_set(name, value) {
  return ui.setValue(name, value);
}
function ui_status(stat) {
  ui_set("Status", stat);
}
function update_h() {
  update_f = true;
}
function resize_h() {
  update_f = true;
  cv_w = ui_get("Width");
  cv_h = ui_get("Height");
  localStorage.setItem('cv_w', cv_w);
  localStorage.setItem('cv_h', cv_h);
  resizeCanvas(cv_offs + cv_w + 10, cv_h * 2 + ui_padd * 2 + 10);
}

// =============== MOUSE ===============
function ui_cursor() {
  cursor(ARROW);
  if (inCanvas()) cursor(HAND);
  if (hold_f) cursor('grab');
}
function inCanvas() {
  let vx = mouseX - cv_offs;
  let vy = mouseY - ui_padd;
  return (vx > 0 && vx < cv_w && vy > 0 && vy < cv_h);
}

function mousePressed() {
  if (inCanvas()) {
    hold_f = true;
    offs.begin(mouseX, mouseY);
  }
}
function mouseReleased() {
  if (hold_f) {
    hold_f = false;
    offs.end(mouseX, mouseY);
  }
}
function mouseDragged() {
  if (hold_f) update_f = true;
}
function mouseWheel(event) {
  if (inCanvas()) {
    update_f = true;
    ui_set('Size', ui_get('Size') - event.delta / 5);
    event.preventDefault();
  }
}
const cv_offs = 280;
const map_w = 900;
const map_h = 600;
const ui_padd = 20;

let nodes = [];
let ui;

function setup() {
  ui = QuickSettings.create(0, 0, "MagicViewer v1.0")
    .addFileChooser("Pick File", "", "", handleFile)
    .addRange('Nodes', 0, 10, 0, 10, update_h)
    .setWidth(cv_offs - ui_padd)
    .setDraggable(false)
    .setCollapsible(false);

  createCanvas(cv_offs + map_w + 10, map_h + ui_padd + 10);
}

function draw() {
}

function handleFile(file) {
  loadStrings((URL.createObjectURL(file)), text => {
    let nodes_am = Number(text[0]);
    nodes = [];
    for (let i = 0; i < nodes_am; i++) {
      let xy = text[i + 1].split(',');
      nodes.push([Number(xy[0]), Number(xy[1])]);
    }
    ui.setRangeParameters("Nodes", 0, nodes_am, 1);
    ui.setValue("Nodes", nodes_am);
  });
}

function update_h() {
  background(255);
  noFill();
  stroke(0);
  //strokeWeight(2);
  //rect(cv_offs, ui_padd, map_w, map_h);

  strokeWeight(0.5);
  let nodes_am = ui.getValue("Nodes");
  for (let i = 1; i < nodes_am; i++) {
    line(cv_offs + nodes[i - 1][0], ui_padd + nodes[i - 1][1], cv_offs + nodes[i][0], ui_padd + nodes[i][1]);
  }
}
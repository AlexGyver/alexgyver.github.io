const cv_offs = 220;
const cv_size = 700;
let cx = cv_offs + cv_size / 2;
let cy = cv_size / 2;
let ui;

// https://github.com/bit101/quicksettings?tab=readme-ov-file#adding-controls

function setup() {
    ui = QuickSettings.create(0, 0)
        .addRange("Freq", 0, 0.2, 0.1, 0.005)
        .addRange("Ampli X", 0, 0.5, 0.3, 0.1)
        .addRange("Mult Y", 0, 5, 1, 1)
        .addRange("Phase Y", 0, Math.PI, 0, 0.1)
        .addRange("Ampli Y", 0, 0.5, 0.3, 0.01)
        .addHTML("", "")
        .addRange("Phase R", 0, 180, 0, 0.1)
        .addRange("Phase G", 0, 180, 0, 0.1)
        .addRange("Phase B", 0, 180, 0, 0.1)
        .setWidth(cv_offs)
        .setDraggable(false)
        .setCollapsible(false);
    createCanvas(cv_offs + cv_size, cv_size, WEBGL);
    createEasyCam();
}

function ui_get(name) {
    return ui.getValue(name);
}
function ui_set(name, value) {
    return ui.setValue(name, value);
}

function draw() {
    background(220);
    rotateX(1.2);
    translate(0, 0, 250);
    noStroke();

    let colors = ['red', 'green', 'blue'];
    let phase = [ui_get("Phase R"), ui_get("Phase G"), ui_get("Phase B")];
    for (let i = 0; i < 3; i++) {
        push();
        fill(colors[i]);
        for (let z = 0; z < 500; z += 0.5) {
            push();
            let x = z * ui_get("Ampli X") * Math.sin((z + phase[i]) * ui_get("Freq"));
            let y = z * ui_get("Ampli Y") * Math.sin((z + phase[i]) * ui_get("Freq") * ui_get("Mult Y") + ui_get("Phase Y"));
            translate(x, y);
            box(5, 5, 5);
            pop();
            translate(0, 0, -0.5);
        }
        pop();
    }
}

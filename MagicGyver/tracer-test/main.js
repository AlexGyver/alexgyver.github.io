const cv_offs = 280;
const ui_padd = 20;
const size = 30;
const map_w = 25;
const map_h = 20;

let ui;
let src_map;
var easystar = new EasyStar.js();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function getX(x) {
    return cv_offs + ui_padd + x * size;
}
function getY(y) {
    return ui_padd + y * size;
}
function idx(x, y) {
    return x + y * map_w;
}
function brezLine(arr, value, x0, y0, x1, y1) {
    let dx = Math.abs(x1 - x0);
    let sx = x0 < x1 ? 1 : -1;
    let dy = -Math.abs(y1 - y0);
    let sy = y0 < y1 ? 1 : -1;
    let err = dx + dy, e2;

    while (1) {
        setBuf(arr, x0, y0, value);
        if (x0 == x1 && y0 == y1) break;
        e2 = 2 * err;
        if (e2 >= dy) {
            err += dy;
            x0 += sx;
        }
        if (e2 <= dx) {
            err += dx;
            y0 += sy;
        }
    }
}
function brezCircle(arr, value, x0, y0, r) {
    let x = -r;
    let y = 0;
    let err = 2 - 2 * r;
    do {
        brezLine(arr, value, x0 + x, y0 - y, x0 + x, y0 + y);
        brezLine(arr, value, x0 - x, y0 - y, x0 - x, y0 + y);
        brezLine(arr, value, x0 + y, y0 - x, x0 + y, y0 + x);
        brezLine(arr, value, x0 - y, y0 - x, x0 - y, y0 + x);

        r = err;
        if (r <= y) err += ++y * 2 + 1;
        if (r > x || err > y) err += ++x * 2 + 1;
    } while (x < 0);
}
function setBuf(buf, x, y, v) {
    if (x < 0 || x >= map_w || y < 0 || y >= map_h) return;
    buf[idx(x, y)] = v;
}

window.addEventListener("contextmenu", e => e.preventDefault());

// ==============================
function setup() {
    if (localStorage.hasOwnProperty('map')) src_map = JSON.parse(localStorage.getItem('map'));
    else src_map = new Array(map_w * map_h).fill(0);

    ui = QuickSettings.create(0, 0)
        .addHTML("Map",
            "<button class='qs_button' onclick='save_h()'>Save</button>&nbsp;" +
            "<button class='qs_button' onclick='clear_h()'>Clear</button>")
        .addRange("Brush", 0, 5, 0, 1)
        .addRange("Delay", 0, 100, 30, 5)
        .addBoolean("Optimise", 1)
        .addHTML("Control",
            "<button class='qs_button' onclick='start_h()'>Start</button>&nbsp;" +
            "<button class='qs_button' onclick='stop_h()'>Stop</button>")

        .setWidth(cv_offs - ui_padd)
        .setDraggable(false)
        .setCollapsible(false);

    createCanvas(cv_offs + ui_padd + map_w * size, ui_padd + map_h * size);
}

function draw() {
    if (!status_f) {
        background(255);
        stroke(0);
        strokeWeight(0.3);
        for (let y = 0; y < map_h; y++) {
            for (let x = 0; x < map_w; x++) {
                fill((1 - src_map[idx(x, y)]) * 255);
                rect(getX(x), getY(y), size, size);
            }
        }
        cursor(ARROW);
        if (mouseX > cv_offs + ui_padd &&
            mouseX < cv_offs + ui_padd + map_w * size &&
            mouseY > ui_padd &&
            mouseY < ui_padd + map_h * size) {
            cursor(HAND);
            let x = Math.floor((mouseX - (cv_offs + ui_padd)) / size);
            let y = Math.floor((mouseY - ui_padd) / size);
            fill('#ff05');
            if (mouseIsPressed) {
                let r = ui.getValue("Brush");
                if (mouseButton === LEFT) {
                    brezCircle(src_map, 1, x, y, r);
                    fill('#0f05');
                }
                if (mouseButton === RIGHT) {
                    brezCircle(src_map, 0, x, y, r);
                    fill('#f005');
                }
            }
            rect(getX(x), getY(y), size, size);
        }
    }
}

// ==============================
function start_h() {
    startCrawl();
    main();
}
function stop_h() {
    stop_f = 1;
    status_f = 0;
}
function save_h() {
    localStorage.setItem('map', JSON.stringify(src_map));
}
function clear_h() {
    src_map = new Array(map_w * map_h).fill(0);
    stop_h();
}

function show_map() {
    background(255);

    // map
    stroke(0);
    strokeWeight(0.3);
    for (let y = 0; y < map_h; y++) {
        for (let x = 0; x < map_w; x++) {
            let v = 1 - map[idx(x, y)];
            fill(v * 255);
            rect(getX(x), getY(y), size, size);
        }
    }

    // head
    fill(255, 0, 0);
    rect(getX(cr_x), getY(cr_y), size, size);

    // path
    stroke(255, 0, 0);
    strokeWeight(1);
    for (let i = 0; i < coords.length - 1; i++) {
        line(getX(coords[i + 1][0]) + size / 2,
            getY(coords[i + 1][1]) + size / 2,
            getX(coords[i][0]) + size / 2,
            getY(coords[i][1]) + size / 2
        );

    }

    stroke(0);
    strokeWeight(0.3);
    for (let y = 0; y < map_h; y++) {
        for (let x = 0; x < map_w; x++) {
            if (src_map[idx(x, y)]) {
                fill(0, 80);
                rect(getX(x), getY(y), size, size);
            }
            if (vis_map[idx(x, y)]) {
                fill(0, 30);
                rect(getX(x), getY(y), size, size);
            }
        }
    }
}

let wait = 0;
let status_f = 0;
let stop_f = 0;
let cr_x = 0, cr_y = 0, cr_px = 0, cr_py = 0;
let cr_size = 1;
let cr_head = 0;
let cr_count = 0;
let cr_loop = 0;
let cr_skip = 1;
let coords = [];
let map = [];
let vis_map = [];
let optimise = 0;

async function main() {

    async function checkArea() {

        async function findPath(x, y) {
            return new Promise(function (resolve) {
                vis_map[x + y * map_w] = 1;
                let xy = [];
                for (let y = 0; y < map_h; y++) {
                    xy.push([]);
                    for (let x = 0; x < map_w; x++) {
                        xy[y].push(vis_map[x + y * map_w]);
                    }
                }
                easystar.setAcceptableTiles([1]);
                easystar.enableDiagonals();
                easystar.setGrid(xy);
                let interval = setInterval(() => easystar.calculate(), 1);
                easystar.findPath(cr_x, cr_y, x, y, function (path) {
                    clearInterval(interval);
                    resolve(path);
                });
            });
        }

        async function check(x, y, dir) {
            //await sleep(wait);
            // search
            fill(255, 255, 0, 100);
            rect(getX(x), getY(y), size, size);

            if (getBuffer(x, y) == 1) {
                if (cr_size == 1) {
                    let b = [
                        [0, 3, 1, 0],
                        [1, 0, 0, 1],
                        [2, 1, -1, 0],
                        [3, 2, 0, -1],
                        [1, 1, -1, 0],
                        [2, 2, 0, -1],
                        [3, 3, 1, 0],
                        [0, 0, 0, 1]
                    ];
                    for (let i = 0; i < b.length; i++) {
                        if (cr_head == b[i][0] && dir == b[i][1] && getBuffer(x + b[i][2], y + b[i][3])) {
                            moveTo(x + b[i][2], y + b[i][3]);
                            break;
                        }
                    }
                    /*if (cr_head == 0 && dir == 3 && getBuffer(x + 1, y)) moveTo(x + 1, y);
                    else if (cr_head == 1 && dir == 0 && getBuffer(x, y + 1)) moveTo(x, y + 1);
                    else if (cr_head == 2 && dir == 1 && getBuffer(x - 1, y)) moveTo(x - 1, y);
                    else if (cr_head == 3 && dir == 2 && getBuffer(x, y - 1)) moveTo(x, y - 1);

                    else if (cr_head == 1 && dir == 1 && getBuffer(x - 1, y)) moveTo(x - 1, y);
                    else if (cr_head == 2 && dir == 2 && getBuffer(x, y - 1)) moveTo(x, y - 1);
                    else if (cr_head == 3 && dir == 3 && getBuffer(x + 1, y)) moveTo(x + 1, y);
                    else if (cr_head == 0 && dir == 0 && getBuffer(x, y + 1)) moveTo(x, y + 1);*/
                }

                if (optimise && cr_size > 1 && coords.length > 1) {
                    let ssize = 1;
                    let xx, yy;
                    function getVis(x, y) {
                        if (x < 0 || x >= map_w || y < 0 || y >= map_h) return 0;
                        return vis_map[idx(x, y)];
                    }
                    while (1) {
                        for (let ix = x - ssize; ix < x + ssize; ix++) {
                            if (getVis(ix, y - ssize)) {
                                xx = ix;
                                yy = y - ssize;
                                break;
                            }
                            if (getVis(ix, y + ssize)) {
                                xx = ix;
                                yy = y + ssize;
                                break;
                            }
                        }
                        for (let iy = y - ssize; iy < y + ssize; iy++) {
                            if (getVis(x - ssize, iy)) {
                                xx = x - ssize;
                                yy = iy;
                                break;
                            }
                            if (getVis(x + ssize, iy)) {
                                xx = x + ssize;
                                yy = iy;
                                break;
                            }
                        }
                        ssize++;
                        if (xx) break;
                    }
                    let path = await findPath(xx, yy);
                    if (path) {
                        for (let i = 0; i < path.length; i++) {
                            await moveTo(path[i].x, path[i].y);
                        }
                    }
                    await moveTo(x, y);
                } else {
                    await moveTo(x, y);
                }
                return true;
            }
            return false;
        }

        async function moveTo(x, y) {
            coords.push([x, y]);
            brezLine(vis_map, 1, cr_x, cr_y, x, y);
            cr_count++;
            map[idx(x, y)] = 0;

            if (cr_count % cr_skip == 0) {
                cr_px = x;
                cr_py = y;
            }
            cr_x = x;
            cr_y = y;
            show_map();
            await sleep(wait);
        }

        function getBuffer(x, y) {
            if (x < 0 || x >= map_w || y < 0 || y >= map_h) return 0;
            return map[idx(x, y)];
        }

        let checkers = [
            async function () {
                for (let x = cr_x - cr_size + 1; x <= cr_x + cr_size; x++) {
                    if (await check(x, cr_y - cr_size, 0)) return 0;
                }
                return -1;
            },
            async function () {
                for (let y = cr_y - cr_size + 1; y <= cr_y + cr_size; y++) {
                    if (await check(cr_x + cr_size, y, 1)) return 1;
                }
                return -1;
            },
            async function () {
                for (let x = cr_x + cr_size - 1; x >= cr_x - cr_size; x--) {
                    if (await check(x, cr_y + cr_size, 2)) return 2;
                }
                return -1;
            },
            async function () {
                for (let y = cr_y + cr_size - 1; y >= cr_y - cr_size; y--) {
                    if (await check(cr_x - cr_size, y, 3)) return 3;
                }
                return -1;
            }
        ];

        for (let i = 0; i < 4; i++) {
            let v = await checkers[(cr_head + 3 + i) % 4]();
            if (v >= 0) {
                cr_head = v;
                return v;
            }
            await sleep(wait);
        }
        return -1;
    }

    while (true) {
        let v = await checkArea();
        if (v >= 0) cr_size = 1;
        else cr_size++;

        if (cr_size >= map_w) return;
        let stop = true;
        for (let i = 0; i < map.length; i++) {
            if (map[i] == 1) {
                stop = false;
                break;
            }
        }
        if (stop || stop_f) {
            stop_f = 0;
            return;
        }
    }
}

function startCrawl() {
    stop_f = 0;
    coords = [[0, 0]];
    map = [...src_map];
    vis_map = new Array(map_w * map_h).fill(0);
    cr_x = 0, cr_y = 0, cr_px = 0, cr_py = 0;
    cr_count = 0;
    cr_size = 1;
    status_f = 1;
    wait = ui.getValue("Delay");
    optimise = ui.getValue("Optimise");
    show_map();
}
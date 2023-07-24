let img_buf = null;
let img_map = [];
let offs = new Offset();

// =============== SETUP ===============
function setup() {
  ui_init();
  select_h();
  createCanvas(cv_offs + map_w + 10, map_h * 2 + ui_padd * 2 + 10);
  imageMode(CENTER);
  ellipseMode(CENTER);
}

// =============== MAIN LOOP ===============
function draw() {
  ui_cursor();

  if (update_f) {
    update_f = false;
    run_f = false;
    if (hold_f) offs.update(mouseX, mouseY);
    showImage();
    if (ui_get('Autostart')) start();
  }

  if (run_f && img_buf) {
    switch (ui_get('Trace').label) {
      case 'Crawl':
        traceCrawl();
        break;
      case 'Waves':
        traceWaves();
        break;
    }
  }
}

function showImage() {
  background(255);

  if (img_buf) {
    let show = createImage(img_buf.width, img_buf.height);
    show.copy(img_buf, 0, 0, img_buf.width, img_buf.height, 0, 0, img_buf.width, img_buf.height);

    if (show.width < show.height) show.resize(ui_get("Size"), 0);
    else show.resize(0, ui_get("Size"));

    show.filter(GRAY);
    b_and_c(show, ui_get("Brightness"), ui_get("Contrast"));
    if (ui_get('Gamma') > 1.0) gamma(show, ui_get('Gamma'));
    if (ui_get('Blur') > 0) show.filter(BLUR, ui_get('Blur'));
    //if (ui_get('Poster') > 1) show.filter(POSTERIZE, ui_get('Poster'));
    if (ui_get("Threshold") > 0) show.filter(THRESHOLD, ui_get('Threshold'));

    switch (ui_get('Edges').label) {
      case 'Median':
        median_edges(show);
        break;
      case 'Sobel':
        sobel_edges(show);
        break;
    }

    show = show.get(show.width / 2 - map_w / 2 - offs.offs_x, show.height / 2 - map_h / 2 - offs.offs_y, map_w, map_h);
    image(show, cv_offs + map_w / 2, map_h / 2 + ui_padd);

    show.loadPixels();
    img_map = Array(map_w * map_h);
    for (let i = 0; i < img_map.length; i++) {
      img_map[i] = (show.pixels[i * 4 + 3]) ? show.pixels[i * 4] : 255;
    }
  }

  // frame
  noFill();
  stroke(0);
  strokeWeight(2);
  rect(cv_offs, ui_padd, map_w, map_h);
  rect(cv_offs, ui_padd + map_h + ui_padd, map_w, map_h);
}

function handleFile(file) {
  if (file.type.toString().includes('image')) {
    loadImage(URL.createObjectURL(file), nimg => {
      let img = createImage(nimg.width, nimg.height);
      img.copy(nimg, 0, 0, nimg.width, nimg.height, 0, 0, nimg.width, nimg.height);
      handleImage(img);
    });
  }
}

function handleImage(img) {
  img_buf = createImage(img.width, img.height);
  img_buf.copy(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
  if (img_buf.width < img_buf.height) img.resize(map_w, 0);
  else img_buf.resize(0, map_h);

  update_h();
  ui_set('Brightness', 0);
  ui_set('Edges', 0);
  ui_set('Contrast', 1);
  ui_set('Gamma', 1.0);
  ui_set('Size', map_w);
  offs.reset();
}

function start() {
  run_f = true;
  coords = [];
  ui_set('Status', 'Run');

  switch (ui_get('Trace').label) {
    case 'Crawl': startCrawl();
      break;
    case 'Waves':
      break;
  }
}
function stop() {
  ui_set('Status', 'Done ' + coords.length + ' nodes');
  if (!run_f) update_f = true;
  run_f = false;
}
function save_h() {
  let str = (coords.length + 1) + '\n';
  str += '0,0\n';

  if (ui_get('Reverse')) {
    for (let i = 0; i < coords.length; i++) {
      str += coords[coords.length - i - 1][0] + ',' + coords[coords.length - i - 1][1] + '\n';
    }
  } else {
    for (let i = 0; i < coords.length; i++) {
      str += coords[i][0] + ',' + coords[i][1] + '\n';
    }
  }
  saveStrings([str], 'trace');
}
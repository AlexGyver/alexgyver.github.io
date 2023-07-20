let img_buf = null;
let img_map = [cv_w * cv_h];
let offs = new Offset();

// =============== SETUP ===============
function setup() {
  ui_init();
  select_h();
  createCanvas(cv_offs + cv_w + 10, cv_h * 2 + ui_padd * 2 + 10);
  imageMode(CENTER);
  ellipseMode(CENTER);

  /*loadImage('ag.jpg', img => {
    handleImage(img);
  });*/

  /*let size = 3;
  function pointOffs2(x, y) {
    strokeWeight(5)
    stroke(0,0,0,100)
    pointOffs(x*10+50, y*10);
  }
  for (let x = tx - size; x < tx + size; x++) {
     pointOffs2(x, ty - size);
  }
  for (let y = ty - size; y < ty + size; y++) {
     pointOffs2(tx + size, y);
  }
  for (let x = tx + size; x > tx - size; x--) {
     pointOffs2(x, ty + size);
  }
  for (let y = ty + size; y > ty - size; y--) {
     pointOffs2(tx - size, y)
  }*/
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

    show = show.get(show.width / 2 - cv_w / 2 - offs.offs_x, show.height / 2 - cv_h / 2 - offs.offs_y, cv_w, cv_h);
    image(show, cv_offs + cv_w / 2, cv_h / 2 + ui_padd);

    show.loadPixels();
    for (let i = 0; i < cv_w * cv_h; i++) {
      img_map[i] = (show.pixels[i * 4 + 3]) ? show.pixels[i * 4] : 255;
    }
  }

  // frame
  noFill();
  stroke(0);
  strokeWeight(2);
  rect(cv_offs, ui_padd, cv_w, cv_h);
  rect(cv_offs, ui_padd + cv_h + ui_padd, cv_w, cv_h);
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
  if (img_buf.width < img_buf.height) img.resize(cv_w, 0);
  else img_buf.resize(0, cv_h);

  update_h();
  ui_set('Brightness', 0);
  ui_set('Edges', 0);
  ui_set('Contrast', 1);
  ui_set('Gamma', 1.0);
  ui_set('Size', cv_w);
  offs.reset();
}

function start() {
  run_f = true;
  coords = '0,0\n';
  coords_am = 0;
  ui_set('Status', 'Run');

  switch (ui_get('Trace').label) {
    case 'Crawl': startCrawl();
      break;
    case 'Waves':
      break;
  }
}
function stop() {
  ui_set('Status', 'Done ' + coords_am + ' nodes');
  if (!run_f) update_f = true;
  run_f = false;
}
function save_h() {
  saveStrings([(coords_am + 1), coords], 'trace');
}
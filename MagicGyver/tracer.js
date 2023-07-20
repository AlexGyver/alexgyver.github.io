let coords = '';
let coords_am = 0;

// =============== WAVES ===============
function traceWaves() {
  strokeWeight(1);
  stroke(0);
  let A = ui_get('Amplitude');
  let am = ui_get('Row amount');
  let size = Math.ceil(cv_h / am);
  let cr_px = 0, cr_py = 0;
  for (let row = 0; row < am; row++) {
    let phase = 0;
    for (let col = 0; col < cv_w; col++) {
      let val = 0;
      let x = (row % 2) ? (cv_w - col - 1) : col;
      let y = row * size + size / 2;

      for (let s = 0; s < size; s++) {
        val += img_map[x + (row * size + s) * cv_w];
      }
      val /= size;
      val = 255 - val;
      phase += val / 255;
      y += sin(phase) * size / 2 * val / 255 * A;
      lineOffs(cr_px, cr_py, x, y);
      //stroke(255-val)
      //lineOffs(x, row*size, x, (row+1)*size);
      cr_px = x;
      cr_py = y;
      coords += x + ',' + Math.round(y) + '\n';
      coords_am++;
    }
  }
  stop();
}

// =============== CRAWL ===============
let cr_x = 0, cr_y = 0, cr_px = 0, cr_py = 0;
let cr_size = 1;
let cr_head = 0;
let cr_count = 0;
let cr_loop = 0;
let cr_skip = 1;

function traceCrawl() {

  function checkArea() {

    function check(x, y) {
      if (getBuffer(x, y) != 255) {
        moveTo(x, y);
        return true;
      }
      return false;
    }

    function moveTo(x, y) {
      cr_count++;
      img_map[x + y * cv_w] = 255;

      if (cr_count % cr_skip == 0) {
        lineOffs(cr_px, cr_py, x, y);
        cr_px = x;
        cr_py = y;
        coords += Math.round(x) + ',' + Math.round(y) + '\n';
        coords_am++;
      }
      cr_x = x;
      cr_y = y;
    }

    function getBuffer(x, y) {
      if (x < 0 || x >= cv_w || y < 0 || y >= cv_h) return 255;
      return img_map[x + y * cv_w];
    }

    let checkers = [
      function () {
        for (let x = cr_x - cr_size; x < cr_x + cr_size; x++) {
          if (check(x, cr_y - cr_size)) return 1;
        }
        return 0;
      },
      function () {
        for (let y = cr_y - cr_size; y < cr_y + cr_size; y++) {
          if (check(cr_x + cr_size, y)) return 2;
        }
        return 0;
      },
      function () {
        for (let x = cr_x + cr_size; x > cr_x - cr_size; x--) {
          if (check(x, cr_y + cr_size)) return 3;
        }
        return 0;
      },
      function () {
        for (let y = cr_y + cr_size; y > cr_y - cr_size; y--) {
          if (check(cr_x - cr_size, y)) return 4;
        }
        return 0;
      }
    ];

    for (let i = 0; i < 4; i++) {
      let v = checkers[cr_loop ? ((cr_head + i) % 4) : i]();
      if (v) {
        cr_head = v + 2;
        return v;
      }
    }
    return 0;
  }

  stroke(0);
  strokeWeight(0.7);
  let loops = 0;
  while (true) {
    if (checkArea()) cr_size = 1;
    else cr_size++;

    if (cr_size >= cv_w) {
      stop();
      break;
    }

    if (++loops > 500 * cr_skip) break;
  }
}

function startCrawl() {
  cr_x = 0, cr_y = 0, cr_px = 0, cr_py = 0;
  cr_count = 0;
  cr_size = 1;
  cr_loop = ui_get('Loop');
  cr_skip = ui_get('Skip');
}

/*
let noffs = 0;
let nx = cv_w/2, ny = cv_h/2;
let px = cv_w/2, py = cv_h/2;

function lineTest() {
  let step = 3;
  noffs += 0.05;

  nx = noise(noffs + 5) * cv_w;
  ny = noise(noffs) * cv_h;

  strokeWeight(1);
  stroke(0);
  lineOffs(px, py, nx, ny);
  px = nx;
  py = ny;
}
*/
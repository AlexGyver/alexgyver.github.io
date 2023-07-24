let coords = '';

// =============== WAVES ===============
function traceWaves() {
  strokeWeight(1);
  stroke(0);
  let A = ui_get('Amplitude');
  let am = ui_get('Row amount');
  let size = Math.ceil(map_h / am);
  let cr_px = 0, cr_py = 0;
  for (let row = 0; row < am; row++) {
    let phase = 0;
    for (let col = 0; col < map_w; col++) {
      let val = 0;
      let x = (row % 2) ? (map_w - col - 1) : col;
      let y = row * size + size / 2;

      for (let s = 0; s < size; s++) {
        val += img_map[x + (row * size + s) * map_w];
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
      coords.push([x, Math.round(y)]);
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
let cr_opt = 0;
let cr_skip = 1;
let vis_map = [];
let map = [];
var easystar = new EasyStar.js();

function traceCrawl() {

  function checkArea() {

    function brezLine(arr, value, x0, y0, x1, y1) {
      let dx = Math.abs(x1 - x0);
      let sx = x0 < x1 ? 1 : -1;
      let dy = -Math.abs(y1 - y0);
      let sy = y0 < y1 ? 1 : -1;
      let err = dx + dy, e2;

      while (1) {
        arr[idx(x0, y0)] = value;
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

    function idx(x, y) {
      return x + y * map_w;
    }
    function findPath(x, y) {
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
      return easystar.findPathSync(cr_x, cr_y, x, y);
    }

    function check(x, y, dir) {
      if (getBuffer(x, y) == 1) {

        // optimise 1px turn
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
        }
        // optimise 1px turn

        if (cr_opt && cr_size > 1 && coords.length) {
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
          let path = findPath(xx, yy);
          if (path) {
            for (let i = 0; i < path.length; i++) {
              moveTo(path[i].x, path[i].y);
            }
          }
          moveTo(x, y);
        } else {
          moveTo(x, y);
        }

        return true;
      }
      return false;
    }

    function moveTo(x, y) {
      cr_count++;
      map[idx(x, y)] = 0;
      brezLine(vis_map, 1, cr_x, cr_y, x, y);

      if (cr_count % cr_skip == 0) {
        lineOffs(cr_px, cr_py, x, y);
        cr_px = x;
        cr_py = y;
        coords.push([Math.round(x), Math.round(y)]);
      }
      cr_x = x;
      cr_y = y;
    }

    function getBuffer(x, y) {
      if (x < 0 || x >= map_w || y < 0 || y >= map_h) return 0;
      return map[idx(x, y)];
    }

    let checkers = [
      function () {
        for (let x = cr_x - cr_size; x < cr_x + cr_size; x++) {
          if (check(x, cr_y - cr_size, 0)) return 0;
        }
        return -1;
      },
      function () {
        for (let y = cr_y - cr_size; y < cr_y + cr_size; y++) {
          if (check(cr_x + cr_size, y, 1)) return 1;
        }
        return -1;
      },
      function () {
        for (let x = cr_x + cr_size; x > cr_x - cr_size; x--) {
          if (check(x, cr_y + cr_size, 2)) return 2;
        }
        return -1;
      },
      function () {
        for (let y = cr_y + cr_size; y > cr_y - cr_size; y--) {
          if (check(cr_x - cr_size, y, 3)) return 3;
        }
        return -1;
      }
    ];

    for (let i = 0; i < 4; i++) {
      let v = checkers[cr_loop ? ((cr_head + 3 + i) % 4) : i]();
      if (v >= 0) {
        cr_head = v;
        return v;
      }
    }
    return -1;
  }

  stroke(0);
  strokeWeight(0.7);
  let loops = 0;
  while (true) {
    if (checkArea() >= 0) cr_size = 1;
    else cr_size++;

    if (cr_size >= map_w) {
      stop();
      break;
    }

    if (++loops > 300 * cr_skip) break;
  }
}

function startCrawl() {
  cr_x = 0, cr_y = 0, cr_px = 0, cr_py = 0;
  cr_count = 0;
  cr_size = 1;
  cr_loop = ui_get('Loop');
  cr_skip = ui_get('Skip');
  cr_opt = ui_get('Optimise');
  vis_map = new Array(map_w * map_h).fill(0);
  map = new Array(map_w * map_h).fill(0);
  for (let i = 0; i < img_map.length; i++) {
    if (img_map[i] != 255) map[i] = 1;
  }
}
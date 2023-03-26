/*global pixelDensity, loadPixels, abs, min, updatePixels,
stroke, strokeWeight, line, dist, pixels, width */

export const useTracer = (ui, { cv, get_xy }) => {
  let radialFill = [];
  let ui_negative;
  let ui_center;
  let ui_radial;
  let radialGranularity = 32;
  let nodes = [];
  let overlaps = [];
  let length;
  let density = pixelDensity();
  let node = 0;
  let count = 0;
  let best = 0;
  let tmr;

  const getRadialMask = (x0, y0, x1, y1) => {
    if (radialGranularity <= 0) return 0;
    let angle = x1 == x0 ? (y0 < y1 ? 1 : -1) : Math.atan((y1 - y0) / (x1 - x0));
    let radialAngle = Math.round((angle + Math.PI / 2) * radialGranularity / Math.PI);
    return 1 << radialAngle;
  }
  const getPixelIndex = (x, y) => Math.round((x + y * width * density) * 4 * density);

  const scanLine = (start, end) => {
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
    let radialMask = getRadialMask(x0, y0, x1, y1);

    // eslint-disable-next-line no-constant-condition -- it's by design
    while (true) {
      let i = getPixelIndex(x0, y0);
      let val;

      if (ui_negative) {
        val = (255 - pixels[i]) - (255 - pixels[i + 3]);
      } else {
        val = 255 - pixels[i];
      }

      if (ui_center) {
        let cx = abs(cv.circles[0].x - x0);
        let cy = abs(cv.circles[0].y - y0);
        let cl = Math.sqrt(cx * cx + cy * cy);
        val *= Math.log(cv.diameter / 2 / cl);
      }

      if (ui_radial) {
        if (radialMask == 0 || ((radialFill[i] || 0) & radialMask) == 0) sum += val;
      } else {
        sum += val;
      }

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

  const clearLine = (xy, w, a) => {
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
      let radialMask = getRadialMask(x0, y0, x1, y1);

      // eslint-disable-next-line no-constant-condition -- it's by design
      while (true) {
        let i = getPixelIndex(x0, y0);
        radialFill[i] = (radialFill[i] || 0) | radialMask;

        if (ui_negative) {
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

  const run = (nStrings, stop_f) => {
    if (count < 2) { // just started
      tmr = Date.now();
    }
    ui.Status = `Running. Lines: ${count}`;

    let ui_amount = ui['Node Amount'];
    let ui_offset = ui.Offset;
    let ui_quarter = ui.Quarter;
    let ui_overlaps = ui.Overlaps;
    let ui_max = ui['Max Lines'];
    let ui_clear_a = ui['Clear Alpha'];
    let ui_clear_w = ui['Clear Width'];
    let ui_diameter = ui.Diameter;
    let ui_thick = ui.Thickness;
    let last_max = [1,1,1,1,1];

    ui_negative = ui.Negative;
    ui_center = ui['Center Balance'];
    ui_radial = ui['Radial Granularity'];
    //radialGranularity = ui['Radial Granularity'];

    for (let i = 0; i < nStrings; i++) {
      let max = -Infinity;
      best = -1;

      loadPixels();
      for (let i = 1; i < ui_amount; i++) {
        if (node == i) continue;

        if (count >= 2) {
          let dst = abs(i - nodes[count - 2]);
          if (dst > ui_amount / 2) dst = ui_amount - dst;
          dst = dst / ui_amount * 360;
          if (dst < ui_offset) continue;
        }

        if (ui_quarter) {
          let delta = abs(node - i);
          if (min(ui_amount - delta, delta) <= ui_amount / 8) continue;
        }

        if (ui_overlaps > 0 && overlaps[i] + 1 > ui_overlaps) continue;
        let res = scanLine(node, i);

        if (res > max) {
          max = res;
          best = i;
        }
      }
      overlaps[best]++;

      last_max.push(max);
      last_max.shift();
      let stop = true;
      for (let m in last_max) if (last_max[m] != 0) stop = false;

      if (count > ui_max || best < 0 || stop || /*max < ui['Threshold'] || */stop_f) {
        count--;
        ui.Status = `Done! ${count} lines, ${Math.round(length / 100)}m, max overlap ${Math.max(...overlaps)} in ${((Date.now() - tmr) / 1000).toFixed(1)} seconds`;
        ui.Nodes = nodes;
        nodes.push(ui_amount & 0xff);

        ui['Nodes B64'] = btoa(String.fromCharCode.apply(null, new Uint8Array(nodes)));
        nodes.pop();
        return false; // running
      }

      nodes.push(best);
      let xy = [get_xy(0, node), get_xy(0, best)];
      /*
      updatePixels();
      stroke(255, 255, 255, ui_clear_a);
      strokeWeight(ui_clear_w);
      line(xy[0].x, xy[0].y, xy[1].x, xy[1].y);
      */
      clearLine(xy, ui_clear_w, ui_clear_a);
      updatePixels();

      stroke(0, 0, 0, 150);
      strokeWeight(ui_thick / ((ui_diameter * 10 / cv.diameter)));

      xy = [get_xy(1, node), get_xy(1, best)];
      line(xy[0].x, xy[0].y, xy[1].x, xy[1].y);
      length += dist(xy[0].x, xy[0].y, xy[1].x, xy[1].y) * ui_diameter / (cv.diameter);
      node = best;
      count++;
    }
    return true; // running
  }

  const reset = () => {
    node = 0;
    count = 1;
    nodes = [0];
    overlaps = new Array(ui['Node Amount']).fill(0);
    length = 0;
    radialFill = [];
  };

  return {
    reset,
    run
  };
}

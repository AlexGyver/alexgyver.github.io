/*global CENTER, stroke, strokeWeight, noStroke, fill, POSTERIZE,
rect, width, height, createImage, GRAY, copy, noFill, circle, createGraphics, save */

export const useUtils = (ui, cv_d, ui_offs) => {

  const get_cv = diameter => ({
    diameter,
    circles: [
      { x: ui_offs + diameter / 2 + 50, y: 50 + diameter / 2 },
      { x: ui_offs + diameter + 100 + diameter / 2, y: 50 + diameter / 2 }
    ]
  });

  let cv = get_cv(cv_d);

  const b_and_c = (input, bright, cont) => {
    let w = input.width;
    let h = input.height;

    input.loadPixels();
    for (let i = 0; i < w * h * 4; i += 4) {

      let r = input.pixels[i];
      let g = input.pixels[i + 1];
      let b = input.pixels[i + 2];

      r = (r * cont + bright);
      g = (g * cont + bright);
      b = (b * cont + bright);

      r = r < 0 ? 0 : r > 255 ? 255 : r;
      g = g < 0 ? 0 : g > 255 ? 255 : g;
      b = b < 0 ? 0 : b > 255 ? 255 : b;

      input.pixels[i] = r;
      input.pixels[i + 1] = g;
      input.pixels[i + 2] = b;
    }
    input.updatePixels();
  }

  const cropImage = () => {
    noStroke();
    fill(255);
    rect(0, 0, width, 50 - 5);
    rect(0, 0, cv.circles[0].x - cv.diameter / 2 - 5, width);
    rect(0, cv.circles[0].y + cv.diameter / 2 + 5, width, height);
    rect(cv.circles[0].x + cv.diameter / 2 + 5, 0, width, height);
  }

  const showImage = (img, offs_x = 0, offs_y = 0) => {
    if (img) {
      let img_x = cv.circles[0].x + offs_x;
      let img_y = cv.circles[0].y + offs_y;
      let show = createImage(img.width, img.height);
      show.copy(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
      show.filter(POSTERIZE, 16);
      show.filter(GRAY);
      show.resize(ui.Size, 0);
      b_and_c(show, ui.Brightness, ui.Contrast);
      //if (ui['Edges'] && !hold_f) edges(show);
      //image(show, img_x, img_y, show.width, show.height);
      copy(show, 0, 0, show.width, show.height, img_x - show.width / 2, img_y - show.width / 2, show.width, show.height);
    }
  }

  const drawCanvas = () => {
    stroke(0);
    strokeWeight(1);
    noFill();
    circle(cv.circles[0].x, cv.circles[0].y, cv.diameter + 7);
    circle(cv.circles[1].x, cv.circles[1].y, cv.diameter);
  }

  const drawNodes = () => {
    noStroke();
    fill(0);
    for (let i = 0; i < ui['Node Amount']; i++) {
      let xy = get_xy(1, i);
      circle(xy.x, xy.y, 5);

      //xy = get_xy(0, i);
      //circle(xy.x, xy.y, 5);
    }
  }

  const get_xy_raw = (x, y, r, cur, max) => {
    x = x + r * Math.cos(2 * Math.PI * cur / max);
    y = y + r * Math.sin(2 * Math.PI * cur / max);
    x = Math.round(x);
    y = Math.round(y);
    return { x, y };
  }

  const get_xy = (num, node) => get_xy_raw(cv.circles[num].x, cv.circles[num].y, cv.diameter / 2, node, ui['Node Amount']);

  const template = () => {
    const offs = 100;
    const ratio = 3.778;
    let size = Math.round(ui.Diameter * 10 * ratio) + offs * 2;
    let am = ui['Node Amount'];

    let pg = createGraphics(size, size);
    pg.background(255);
    pg.textSize(17);
    let D = (ui.Diameter * (size / (size - offs * 2))).toFixed(2);
    let y = 0;
    pg.text('Diameter = ' + ui.Diameter + ' cm', 20, y += 25);
    pg.text('Print size = ' + D + 'x' + D + ' cm', 20, y += 25);
    pg.text('Nail distance = ' + (3.14 * D * 10 / am).toFixed(1) + ' mm', 20, y += 25);

    pg.fill(0);
    pg.textAlign(CENTER, CENTER);
    //pg.textFont('Trebuchet MS');


    pg.stroke(0);
    pg.line(size / 2 - 80, size / 2, size / 2 + 80, size / 2);
    pg.line(size / 2, size / 2 - 80, size / 2, size / 2 + 80);

    for (let i = 0; i < am; i++) {
      /*let xy = get_xy_raw(size / 2, size / 2, size / 2 - 100, i, am);
      pg.noStroke();
      pg.circle(xy.x, xy.y, 10);
      pg.stroke(0);
      let xy0 = get_xy_raw(size / 2, size / 2, size / 2 - 150, i, am);
      let xy1 = get_xy_raw(size / 2, size / 2, size / 2 - 55, i, am);
      pg.line(xy0.x, xy0.y, xy1.x, xy1.y);*/

      let xy = get_xy_raw(size / 2, size / 2, size / 2 - offs, i, am);
      pg.noStroke();
      pg.circle(xy.x, xy.y, 6);
      pg.stroke(0);

      if (i % 10 == 0) {
        //pg.textStyle(BOLD);
        pg.textSize(25);
        xy = get_xy_raw(size / 2, size / 2, size / 2 - 20, i, am);
        pg.text(i, xy.x, xy.y);

        let xy0 = get_xy_raw(size / 2, size / 2, size / 2 - offs, i, am);
        let xy1 = get_xy_raw(size / 2, size / 2, size / 2 - 40, i, am);
        pg.line(xy0.x, xy0.y, xy1.x, xy1.y);
      } else {
        //pg.textStyle(NORMAL);
        pg.textSize(15);
        xy = get_xy_raw(size / 2, size / 2, size / 2 - 45, i, am);
        pg.text(i % 10, xy.x, xy.y);

        let xy0 = get_xy_raw(size / 2, size / 2, size / 2 - offs, i, am);
        let xy1 = get_xy_raw(size / 2, size / 2, size / 2 - 55, i, am);
        pg.line(xy0.x, xy0.y, xy1.x, xy1.y);
      }
    }
    save(pg, 'template.png');
  }

  /* function edges(eimg) {
    let kernel = [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]];
    eimg.loadPixels();
    let arr = [];
    for (let i = 0; i < eimg.width * eimg.height; i++) {
      arr.push(eimg.pixels[i * 4]);
    }

    for (let x = 1; x < eimg.width - 1; x++) {
      for (let y = 1; y < eimg.height - 1; y++) {
        let sum = 0;

        for (let kx = -1; kx <= 1; kx++) {
          for (let ky = -1; ky <= 1; ky++) {
            let xpos = x + kx;
            let ypos = y + ky;

            //let idx = (xpos + ypos * eimg.width) * 4;
            //let val = eimg.pixels[idx];
            let val = red(eimg.get(xpos, ypos));

            //let val = arr[(xpos + ypos * eimg.width)];
            sum += kernel[ky + 1][kx + 1] * val;
          }
        }
        //sum = constrain(sum, 0, 255);
        //arr[(x + y * eimg.width)] = sum;
        //let idx = (x + y * eimg.width) * 4;
        //eimg.pixels[idx] = sum;
        //eimg.pixels[idx+1] = sum;
        //eimg.pixels[idx+2] = sum;

        eimg.set(x, y, color(sum, sum, sum));
      }
    }
    for (let i = 0; i < eimg.width * eimg.height; i++) {
      eimg.pixels[i * 4] = arr[i];
      eimg.pixels[i * 4 + 1] = arr[i];
      eimg.pixels[i * 4 + 2] = arr[i];
    }
    eimg.updatePixels();
  }*/

  return {
    get_cv,
    cv,
    cropImage,
    showImage,
    drawCanvas,
    drawNodes,
    get_xy,
    template
  };
}

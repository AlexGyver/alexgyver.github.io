function getPixelIndex(x, y, width) {
  return Math.round((x + y * width * pixelDensity()) * 4 * pixelDensity());
}

function gamma(oimg, exp) {
  oimg.loadPixels();
  for (let i = 0; i < oimg.width * oimg.height * 4; i += 4) {
    let val = Math.pow(oimg.pixels[i], exp);
    oimg.pixels[i] = val;
    oimg.pixels[i + 1] = val;
    oimg.pixels[i + 2] = val;
  }
  oimg.updatePixels();
}

function median_edges(oimg) {
  //let kernel = [[0, 0], [0, 1], [0, -1], [1, 0], [-1, 0]];
  let kernel = [[0, 0], [0, 1], [1, 0]];
  let W = oimg.width;
  let H = oimg.height;

  let bimg = createImage(W, H);
  bimg.copy(oimg, 0, 0, W, H, 0, 0, W, H);

  bimg.loadPixels();
  oimg.loadPixels();
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      if ((x == 0) || (x == W - 1) || (y == 0) || (y == H - 1)) {
        let idx = (x + y * W) * 4;
        let v = 255 - oimg.pixels[idx];
        bimg.pixels[idx] = v;
        bimg.pixels[idx + 1] = v;
        bimg.pixels[idx + 2] = v;
      } else {
        let sum = [];
        for (let i = 0; i < kernel.length; i++) {
          sum.push(oimg.pixels[((x + kernel[i][0]) + (y + kernel[i][1]) * W) * 4]);
        }
        sum.sort();
        let v = sum[sum.length - 1] - sum[0];
        let idx = (x + y * W) * 4;
        bimg.pixels[idx] = v;
        bimg.pixels[idx + 1] = v;
        bimg.pixels[idx + 2] = v;
      }
    }
  }
  bimg.updatePixels();
  bimg.filter(INVERT);
  oimg.copy(bimg, 0, 0, W, H, 0, 0, W, H);
}

function sobel_edges(oimg) {
  let kernel_x = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
  let kernel_y = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
  let W = oimg.width;
  let H = oimg.height;

  let bimg = createImage(W, H);
  bimg.copy(oimg, 0, 0, W, H, 0, 0, W, H);

  bimg.loadPixels();
  oimg.loadPixels();

  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      let sum_x = 0;
      let sum_y = 0;

      if (!((x == 0) || (x == W - 1) || (y == 0) || (y == H - 1))) {
        for (kx = -1; kx <= 1; kx++) {
          for (ky = -1; ky <= 1; ky++) {
            let idx = ((x + kx) + (y + ky) * W) * 4;
            let val = oimg.pixels[idx];
            sum_x += kernel_x[ky + 1][kx + 1] * val;
            sum_y += kernel_y[ky + 1][kx + 1] * val;
          }
        }
      }

      let sum = sqrt(sum_x * sum_x + sum_y * sum_y);
      sum = constrain(sum, 0, 255);

      let idx = (x + y * W) * 4;
      bimg.pixels[idx] = sum;
      bimg.pixels[idx + 1] = sum;
      bimg.pixels[idx + 2] = sum;
    }
  }
  bimg.updatePixels();
  bimg.filter(INVERT);
  oimg.copy(bimg, 0, 0, W, H, 0, 0, W, H);

  /*bimg.loadPixels();
  for (let i = 0; i < W * H * 4; i += 4) {
    //let val = oimg.pixels[i] * (1 - k) + bimg.pixels[i] * k;
    //let val = Math.min(oimg.pixels[i], bimg.pixels[i]);
    //let val = oimg.pixels[i] - (255 - bimg.pixels[i]) * k;
    //if (val < 0) val = 0;
    oimg.pixels[i] = val;
    oimg.pixels[i + 1] = val;
    oimg.pixels[i + 2] = val;
  }
  oimg.updatePixels();*/
}

function b_and_c(input, bright, cont) {
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
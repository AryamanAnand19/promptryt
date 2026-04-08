/**
 * create-icons.js — Pure Node.js PNG icon generator (no external dependencies)
 * Run: node create-icons.js
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZES = [16, 32, 48, 128];
const OUT_DIR = path.join(__dirname, 'icons');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

// ── Minimal PNG encoder ───────────────────────────────────────────────────

function crc32(buf) {
  let crc = 0xffffffff;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c;
    }
    return t;
  })());
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crcBuf = Buffer.concat([typeBytes, data]);
  const crcVal = Buffer.alloc(4); crcVal.writeUInt32BE(crc32(crcBuf));
  return Buffer.concat([len, typeBytes, data, crcVal]);
}

function encodePNG(pixels, width, height) {
  // pixels: Uint8Array of RGBA values, row by row
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB (3 bytes per pixel — we'll drop alpha for simplicity)
  // Actually let's use RGBA: color type 6
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Raw scanlines with filter byte
  const rawRows = [];
  for (let y = 0; y < height; y++) {
    rawRows.push(0); // filter: None
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      rawRows.push(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]);
    }
  }
  const raw = Buffer.from(rawRows);
  const compressed = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

// ── Icon drawing ──────────────────────────────────────────────────────────

function lerp(a, b, t) { return a + (b - a) * t; }

function drawIcon(size) {
  const pixels = new Uint8Array(size * size * 4);

  // Gradient colors: indigo #6366f1 → purple #8b5cf6
  const c1 = [99, 102, 241];
  const c2 = [139, 92, 246];

  const radius = size * 0.2; // rounded corner radius

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;

      // Rounded rect test
      const dx = Math.max(0, Math.max(radius - x, x - (size - 1 - radius)));
      const dy = Math.max(0, Math.max(radius - y, y - (size - 1 - radius)));
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > radius) {
        // Outside rounded rect — transparent
        pixels[i] = pixels[i+1] = pixels[i+2] = pixels[i+3] = 0;
        continue;
      }

      // Inside: gradient background
      const t = (x + y) / (size * 2);
      const r = Math.round(lerp(c1[0], c2[0], t));
      const g = Math.round(lerp(c1[1], c2[1], t));
      const b = Math.round(lerp(c1[2], c2[2], t));

      pixels[i]   = r;
      pixels[i+1] = g;
      pixels[i+2] = b;
      pixels[i+3] = 255;
    }
  }

  // Draw 4-point star in white
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.33;
  const innerR = outerR * 0.28;

  // Rasterize star: for each pixel, test if inside star polygon
  const starPoints = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI / 4) - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    starPoints.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }

  // Point-in-polygon for each pixel
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (pointInPolygon(x + 0.5, y + 0.5, starPoints)) {
        const i = (y * size + x) * 4;
        // Check it's inside the rounded rect (not transparent)
        if (pixels[i+3] > 0) {
          pixels[i]   = 255;
          pixels[i+1] = 255;
          pixels[i+2] = 255;
          pixels[i+3] = 242;
        }
      }
    }
  }

  const png = encodePNG(pixels, size, size);
  const file = path.join(OUT_DIR, `icon${size}.png`);
  fs.writeFileSync(file, png);
  console.log(`✓ icons/icon${size}.png`);
}

function pointInPolygon(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    const intersect = (yi > py) !== (yj > py) &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// ── Run ───────────────────────────────────────────────────────────────────

console.log('Generating PromptRyt icons...');
SIZES.forEach(drawIcon);
console.log('\nDone! All icons saved to /icons/');

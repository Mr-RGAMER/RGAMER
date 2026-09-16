const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function createPNG(width, height, drawPixel) {
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: none
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawPixel(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function crc32(buf) {
    let table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        if (c & 1) c = 0xedb88320 ^ (c >>> 1);
        else c = c >>> 1;
      }
      table[n] = c;
    }
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ (-1)) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeAndData = Buffer.concat([Buffer.from(type), data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([len, typeAndData, crcBuf]);
  }

  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    header,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflated),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// Icon generator logic
// Royal Burgundy: #260533 (r:38, g:5, b:51), Gold: #C9A84C (r:201, g:168, b:76), Warm Light: #FDF6EC
function renderSharanyaIcon(isMaskable) {
  return (x, y, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Background gradient: dark royal violet to burgundy
    const t = (x + y) / (w + h);
    let bgR = Math.round(26 + t * 30);
    let bgG = Math.round(4 + t * 10);
    let bgB = Math.round(36 + t * 35);

    // If not maskable, we can round the corners
    if (!isMaskable) {
      const cornerRadius = w * 0.22;
      const rx = Math.abs(dx) - (w / 2 - cornerRadius);
      const ry = Math.abs(dy) - (h / 2 - cornerRadius);
      if (rx > 0 && ry > 0) {
        const cDist = Math.sqrt(rx * rx + ry * ry);
        if (cDist > cornerRadius) {
          return [0, 0, 0, 0]; // Transparent outside
        }
      }
    }

    // Outer decorative gold ring
    const ringRadius = w * (isMaskable ? 0.38 : 0.42);
    const ringWidth = Math.max(2, w * 0.015);
    if (Math.abs(dist - ringRadius) < ringWidth) {
      return [201, 168, 76, 255]; // Gold
    }

    // Inner subtle ring
    const innerRing = ringRadius * 0.88;
    if (Math.abs(dist - innerRing) < 1.5) {
      return [224, 195, 110, 200];
    }

    // Central Emblem: Royal Diamond & Saree drape motif
    // Center diamond at (cx, cy - h*0.06)
    const emCy = cy - h * 0.05;
    const emDx = Math.abs(x - cx);
    const emDy = Math.abs(y - emCy);
    const diamondSize = w * 0.16;

    if (emDx / (diamondSize * 0.85) + emDy / diamondSize <= 1.0) {
      // Golden Crown / Diamond inside
      const glow = 1 - (emDx + emDy) / diamondSize;
      return [
        Math.min(255, Math.round(201 + glow * 54)),
        Math.min(255, Math.round(168 + glow * 60)),
        Math.min(255, Math.round(76 + glow * 80)),
        255
      ];
    }

    // Decorative crown points
    const topDy = y - (emCy - diamondSize * 1.05);
    if (Math.abs(topDy) < w * 0.025 && emDx < w * 0.025) {
      return [255, 230, 140, 255];
    }

    // Saree Arch / Ribbon curve below diamond
    const ribbonY = cy + h * 0.12;
    const rdx = x - cx;
    const rdy = y - ribbonY;
    const curveY = (rdx * rdx) / (w * 0.4);
    if (Math.abs(rdy - curveY) < (w * 0.022) && Math.abs(rdx) < w * 0.28) {
      return [214, 182, 89, 240];
    }

    // Text bar area: "SF" Monogram block
    const textY = cy + h * 0.24;
    if (Math.abs(y - textY) < h * 0.035 && Math.abs(dx) < w * 0.25) {
      // Small dots/pattern for luxury look
      if ((Math.round(x) % 6 < 3)) {
        return [220, 190, 100, 230];
      }
    }

    return [bgR, bgG, bgB, 255];
  };
}

const publicDir = path.resolve(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. 192x192 PNG
const png192 = createPNG(192, 192, renderSharanyaIcon(false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
console.log('Created pwa-192x192.png (' + png192.length + ' bytes)');

// 2. 512x512 PNG
const png512 = createPNG(512, 512, renderSharanyaIcon(false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
console.log('Created pwa-512x512.png (' + png512.length + ' bytes)');

// 3. 512x512 Maskable (Android Adaptive Icon with safe zone)
const pngMaskable = createPNG(512, 512, renderSharanyaIcon(true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable);
console.log('Created pwa-maskable-512x512.png (' + pngMaskable.length + ' bytes)');

// 4. Apple Touch Icon (180x180 PNG)
const appleIcon = createPNG(180, 180, renderSharanyaIcon(false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);
console.log('Created apple-touch-icon.png (' + appleIcon.length + ' bytes)');

// 5. Favicon fallback
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), png192);
console.log('Created favicon.ico');

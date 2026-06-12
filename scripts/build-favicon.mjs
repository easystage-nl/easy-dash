#!/usr/bin/env node
// Rasterize public/favicon.svg into a multi-resolution public/favicon.ico
// plus the standard PNG companions (apple-touch-icon, 192, 512).
// Run with: npm run favicon

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = resolve(root, "public");
const svgPath = resolve(publicDir, "favicon.svg");

const ICO_SIZES = [16, 24, 32, 48, 64];

// Fraction of each side left as transparent margin around the mark. The PNG
// companions (app icons, og/manifest use) breathe better with padding; the
// favicon.ico stays full-bleed so it reads at tiny tab sizes.
const PNG_PADDING = 0.12;
const PNG_OUTPUTS = [
    { name: "apple-touch-icon.png", size: 180, padding: PNG_PADDING },
    { name: "icon-192.png", size: 192, padding: PNG_PADDING },
    { name: "icon-512.png", size: 512, padding: PNG_PADDING },
];

const TRANSPARENT = { r: 255, g: 255, b: 255, alpha: 0 };
const svg = await readFile(svgPath);

// The source SVG declares an intrinsic size of 64px. sharp rasterizes at
// (intrinsic * density / 96) px, so a fixed density upscales the larger
// outputs and they come out soft. Scale density to each target size — with
// 2x headroom — so every icon is rendered down from a higher-res bitmap.
const SVG_INTRINSIC = 64;
function rasterize(size, padding = 0) {
    const density = Math.ceil((96 * size * 2) / SVG_INTRINSIC);
    const inner = Math.max(1, Math.round(size * (1 - 2 * padding)));
    const img = sharp(svg, { density }).resize(inner, inner, {
        fit: "contain",
        background: TRANSPARENT,
    });
    if (inner === size) return img.png().toBuffer();

    const left = Math.floor((size - inner) / 2);
    const top = left;
    return img
        .extend({
            top,
            bottom: size - inner - top,
            left,
            right: size - inner - left,
            background: TRANSPARENT,
        })
        .png()
        .toBuffer();
}

const icoPngs = await Promise.all(ICO_SIZES.map((s) => rasterize(s)));
const ico = await toIco(icoPngs);
const icoPath = resolve(publicDir, "favicon.ico");
await writeFile(icoPath, ico);
console.log(
    `wrote ${icoPath.replace(root + "/", "")}  ${ico.length} bytes  sizes: ${ICO_SIZES.join(", ")}`,
);

for (const { name, size, padding } of PNG_OUTPUTS) {
    const png = await rasterize(size, padding);
    const path = resolve(publicDir, name);
    await writeFile(path, png);
    console.log(
        `wrote ${path.replace(root + "/", "")}  ${png.length} bytes  ${size}x${size}`,
    );
}

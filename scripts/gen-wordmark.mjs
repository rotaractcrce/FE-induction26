import opentype from "opentype.js";
import fs from "fs";
import { execSync } from "child_process";

const woffPath = process.env.TEMP + "\\Modak-400.woff";
if (!fs.existsSync(woffPath)) {
  execSync(`curl.exe -sL -o "${woffPath}" "https://cdn.jsdelivr.net/npm/@fontsource/modak@5/files/modak-latin-400-normal.woff"`);
}
const font = opentype.parse(fs.readFileSync(woffPath).buffer);
const TEXT = "ROTARACT";
const TARGET_CAP = 330;

// collect glyphs
const glyphs = [];
for (const ch of TEXT) {
  const g = font.charToGlyph(ch);
  glyphs.push({ ch, path: g.getPath(0, 0, font.unitsPerEm) });
}

// measure
let maxY = -1e9, minY = 1e9;
for (const g of glyphs) {
  const bb = g.path.getBoundingBox();
  maxY = Math.max(maxY, bb.y2);
  minY = Math.min(minY, bb.y1);
}
const s = TARGET_CAP / (maxY - minY);

function scaledPath(p, dx = 0, dy = 0) {
  const np = new opentype.Path();
  for (const c of p.commands) {
    const m = { type: c.type };
    for (const k of ["x", "x1", "x2"]) if (c[k] !== undefined) m[k] = +(c[k] * s + dx).toFixed(2);
    for (const k of ["y", "y1", "y2"]) if (c[k] !== undefined) m[k] = +((c[k] * s + dy)).toFixed(2);
    np.commands.push(m);
  }
  return np;
}

let jsx = [], entries = [], rests = [];
let tx = 0;
for (const g of glyphs) {
  let sp = scaledPath(g.path, 0, 0);
  const bb0 = sp.getBoundingBox();
  const dy = +(433 - bb0.y2).toFixed(2); // bottom-align at y=433
  const dx = +(tx - bb0.x1).toFixed(2);
  sp = scaledPath(g.path, dx, dy);
  const bb = sp.getBoundingBox();
  const d = sp.toSVG(2).match(/d="([^"]+)"/)[1];
  jsx.push(`          <g className="wm-l"><g transform="translate(0,0)">
            <path d="${d}" fill="currentColor"/>
          </g></g>`);
  entries.push(`      { sx: 0, sy: 0 },`);
  rests.push(`          [${((bb.x2 + bb.x1) / 2).toFixed(1)}, ${((bb.y2 + bb.y1) / 2).toFixed(1)}],`);
  tx += (bb.x2 - bb.x1) + 36;
}
const totalW = Math.round(tx - 36 + 20);

fs.writeFileSync(new URL("./letters-out.txt", import.meta.url),
`TOTAL_WIDTH=${totalW}

=== JSX (replace the 8 wm-l groups) ===
${jsx.join("\n")}

=== staticsWm ===
    var staticsWm = [
${entries.join("\n")}
    ];

=== restsWm ===
        var restsWm = [
${rests.join("\n")}
        ];
`);
console.log("OK width=" + totalW);

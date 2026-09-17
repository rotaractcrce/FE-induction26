import fs from "fs";

const root = new URL("../", import.meta.url);
const out = fs.readFileSync(new URL("./letters-out.txt", import.meta.url), "utf8");

const width = Number(out.match(/TOTAL_WIDTH=(\d+)/)[1]);
const jsxBlock = out.split("=== JSX (replace the 8 wm-l groups) ===")[1].split("=== staticsWm ===")[0].trim();
let restsBlock = out.split("=== restsWm ===")[1].split("];")[0].trim() + "\n        ];";
restsBlock = restsBlock.replace(/^\s*var restsWm = \[\s*\n/, "");

// Modak has nested counters/islands -> even-odd fill so holes render correctly
const jsxEvenOdd = jsxBlock.replaceAll('fill="currentColor"', 'fill="currentColor" fillRule="evenodd"');

// 1. Continuation.jsx — new viewBox width + new letter groups
const contPath = new URL("../src/components/Continuation.jsx", import.meta.url);
let cont = fs.readFileSync(contPath, "utf8");
cont = cont.replace(/viewBox="0 0 \d+ 433"/, `viewBox="0 0 ${width} 433"`);
const svgOpen = cont.indexOf('<svg className="wordmark-svg-physics"');
const svgInnerStart = cont.indexOf(">", svgOpen) + 1;
const svgClose = cont.indexOf("</svg>", svgInnerStart);
cont = cont.slice(0, svgInnerStart) + "\n" + jsxEvenOdd + "\n        " + cont.slice(svgClose);
fs.writeFileSync(contPath, cont);

// 2. hero-intro.js — widths, rests, evenodd canvas mask fill
const heroPath = new URL("../public/assets/hero-intro.js", import.meta.url);
let hero = fs.readFileSync(heroPath, "utf8");
hero = hero.replace(/var VWWm = \d+,/, `var VWWm = ${width},`);
hero = hero.replace(/var VWWm2 = \d+,/, `var VWWm2 = ${width},`);
const rStart = hero.indexOf("var restsWm = [");
const rEnd = hero.indexOf("];", rStart) + 2;
hero = hero.slice(0, rStart) + "var restsWm = [\n" + restsBlock + hero.slice(rEnd);
hero = hero.replace("mctxWm.fill(pathsWm[i]);", 'mctxWm.fill(pathsWm[i], "evenodd");');
fs.writeFileSync(heroPath, hero);

console.log("applied wordmark width=" + width);

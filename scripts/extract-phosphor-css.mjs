import fs from "node:fs";
import path from "node:path";

const bundlePath = path.join(process.cwd(), "node_modules/@sektant1/phosphor-ui/dist/esm/index.js");
const outputPath = path.join(process.cwd(), "src/styles/phosphor-components.css");
const bundle = fs.readFileSync(bundlePath, "utf8");
const cssCalls = /[;}]c\((["'])((?:\\.|(?!\1)[\s\S])*)\1(?:,\{[^)]*\})?\);/g;
const chunks = [];

let match;
while ((match = cssCalls.exec(bundle))) {
  const quote = match[1];
  const raw = match[2];
  const css = Function(`"use strict"; return ${quote}${raw}${quote};`)();
  chunks.push(css.replace(/^@charset "UTF-8";\n?/gm, ""));
}

if (!chunks.length) {
  throw new Error("No phosphor-ui injected CSS chunks were found.");
}

const banner = [
  "/*",
  " * Generated from @sektant1/phosphor-ui/dist/esm/index.js.",
  " * The package currently injects component CSS from JavaScript; importing this",
  " * file at the Next root prevents a flash of unstyled component markup.",
  " */",
  ""
].join("\n");

fs.writeFileSync(outputPath, `${banner}${chunks.join("\n\n")}\n`);
console.log(`wrote ${outputPath} (${chunks.length} chunks)`);

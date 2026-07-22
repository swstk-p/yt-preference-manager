import fs from "fs";
import path from "path";

const filesToFrom = [
  {
    from: "src/manifest.json",
    to: "dist/manifest.json",
  },
];

for (const ftf of filesToFrom) {
  fs.copyFileSync(ftf.from, ftf.to);
}

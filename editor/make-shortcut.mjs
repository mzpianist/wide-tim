// =============================================================================
// WIDE TIM EDITOR — Desktop shortcut
// `npm run editor:shortcut` puts "Wide Tim Editor.command" on the Desktop,
// with Wide Tim's face as its icon. Double-clicking it opens a Terminal
// window that runs the editor and opens it in the browser; closing that
// window stops the editor. Run this again if the wide_tim folder moves.
// =============================================================================

import { writeFile, chmod, access } from "node:fs/promises";
import { execFile } from "node:child_process";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHORTCUT = path.join(homedir(), "Desktop", "Wide Tim Editor.command");
const ICON = path.join(ROOT, "public", "apple-touch-icon.png");

// Apps opened from Finder don't always get the shell's PATH, so remember
// where node lives now (plus Homebrew's usual spots) for the shortcut to use.
async function nodeDir() {
  for (const dir of (process.env.PATH ?? "").split(":")) {
    if (await access(path.join(dir, "node")).then(() => true, () => false)) return dir;
  }
  return path.dirname(process.execPath);
}

const q = (s) => `'${s.replace(/'/g, `'\\''`)}'`;

const script = `#!/bin/zsh
# Opens the Wide Tim Editor (made by \`npm run editor:shortcut\` in the
# wide_tim folder). Close this window to stop the editor.
export PATH=${[...new Set([await nodeDir(), "/opt/homebrew/bin", "/usr/local/bin"])].map(q).join(":")}:"$PATH"
cd ${q(ROOT)} || { echo "Couldn't find the wide_tim folder at ${ROOT}."; exit 1; }
printf '\\e]0;Wide Tim Editor\\a'
npm run --silent editor
`;

await writeFile(SHORTCUT, script);
await chmod(SHORTCUT, 0o755);

// Give the file Wide Tim's face as its Finder icon.
const setIcon = `
  ObjC.import("AppKit");
  const image = $.NSImage.alloc.initWithContentsOfFile(${JSON.stringify(ICON)});
  $.NSWorkspace.sharedWorkspace.setIconForFileOptions(image, ${JSON.stringify(SHORTCUT)}, 0);
`;
await promisify(execFile)("osascript", ["-l", "JavaScript", "-e", setIcon]).catch(() => {
  console.log("(Couldn't set the shortcut's icon; it still works.)");
});

console.log(`Made ${SHORTCUT}`);

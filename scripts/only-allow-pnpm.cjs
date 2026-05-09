const execPath = process.env.npm_execpath || "";

// pnpm: .../pnpm.cjs
// corepack pnpm: .../corepack/dist/pnpm.js (still OK)
const isPnpm = execPath.includes("pnpm") || execPath.includes("corepack");

if (!isPnpm) {
  // eslint-disable-next-line no-console
  console.error(
    "\n❌ 本專案已鎖定使用 pnpm。\n\n請改用：\n  pnpm install\n  pnpm dev\n"
  );
  process.exit(1);
}


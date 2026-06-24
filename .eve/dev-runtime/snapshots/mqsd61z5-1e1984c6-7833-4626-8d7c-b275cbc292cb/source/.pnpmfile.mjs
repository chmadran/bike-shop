// pnpm 11.x (including the pinned 11.5.2) attempts to import `.pnpmfile.mjs`
// from the workspace root and crashes with "Cannot find module .pnpmfile.mjs"
// when the file is absent. This broke `pnpm install`/`pnpm build` on Vercel.
// Providing this no-op pnpmfile (no hooks) satisfies the loader without
// changing any install behavior.
export const hooks = {}

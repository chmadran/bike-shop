import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** Load .env then .env.local (later files override). Standalone tsx scripts don't get these automatically. */
export function loadLocalEnv(cwd = process.cwd()): void {
  for (const file of [".env", ".env.local"]) {
    const path = join(cwd, file);
    if (!existsSync(path)) continue;

    const content = readFileSync(path, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;

      const key = trimmed.slice(0, eq).trim();
      if (!key) continue;

      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      // .env.local overrides .env (same as Next.js)
      process.env[key] = value;
    }
  }
}

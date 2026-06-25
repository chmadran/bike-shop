import { neon } from "@neondatabase/serverless";
import { loadLocalEnv } from "./load-env";
import { seedVectorDatabase } from "./seed-faq";
import { seedBikeStock } from "./seed-stock";

loadLocalEnv();

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is required in .env.local");
    process.exit(1);
  }

  console.log("Seeding bike_stock...");
  await seedBikeStock();

  console.log("\nSeeding bike_faq (embeddings via AI Gateway)...");
  await seedVectorDatabase();

  console.log("\nDone. Run `pnpm eval` to verify.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

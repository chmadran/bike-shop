import { neon } from "@neondatabase/serverless";
import { bikes } from "../lib/bikes";
import { loadLocalEnv } from "./load-env";

loadLocalEnv();

const WAREHOUSES = ["London", "Manchester"] as const;

export async function seedBikeStock() {
  const sql = neon(process.env.DATABASE_URL!);

  await sql`DELETE FROM bike_stock`;

  for (const bike of bikes) {
    for (const warehouse of WAREHOUSES) {
      await sql`
        INSERT INTO bike_stock (
          model_name, category, price_gbp, weight_kg, best_for, spec,
          warehouse, in_stock, quantity
        ) VALUES (
          ${bike.name},
          ${bike.category},
          ${bike.price},
          ${parseFloat(bike.spec.split(" ")[0]) || null},
          ${bike.description.slice(0, 120)},
          ${bike.spec},
          ${warehouse},
          true,
          ${warehouse === "London" ? 8 : 4}
        )
      `;
    }
  }

  console.log(`Seeded ${bikes.length * WAREHOUSES.length} bike_stock rows from lib/bikes.ts`);
}

if (require.main === module) {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is required in .env.local");
    process.exit(1);
  }
  seedBikeStock().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

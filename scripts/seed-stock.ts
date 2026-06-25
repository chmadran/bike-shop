import { readFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";
import type { Bike } from "../lib/bike-types";
import { loadLocalEnv } from "./load-env";

loadLocalEnv();

const WAREHOUSES = ["London", "Manchester"] as const;

function loadCatalog(): Bike[] {
  const path = join(process.cwd(), "data/bike-catalog.json");
  return JSON.parse(readFileSync(path, "utf8")) as Bike[];
}

async function triggerRevalidation() {
  const secret = process.env.REVALIDATE_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  if (!secret) return;

  try {
    const response = await fetch(`${siteUrl}/api/revalidate?tag=bikes`, {
      method: "POST",
      headers: { "x-revalidate-secret": secret },
    });
    if (response.ok) {
      console.log("Revalidated bikes cache tag");
    } else {
      console.warn(`Revalidate failed (${response.status}) — is the dev server running?`);
    }
  } catch {
    console.warn("Revalidate skipped — could not reach /api/revalidate");
  }
}

async function insertStockRow(
  sql: (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>,
  bike: Bike,
  warehouse: (typeof WAREHOUSES)[number],
  quantity: number,
  includeDisplayColumns: boolean,
) {
  if (includeDisplayColumns) {
    await sql`
      INSERT INTO bike_stock (
        model_id,
        model_name,
        category,
        price_gbp,
        weight_kg,
        best_for,
        spec,
        image,
        description,
        highlights,
        warehouse,
        in_stock,
        quantity
      ) VALUES (
        ${bike.modelId},
        ${bike.name},
        ${bike.category},
        ${bike.priceGbp},
        ${bike.weightKg},
        ${bike.bestFor},
        ${bike.spec},
        ${bike.image},
        ${bike.description},
        ${JSON.stringify(bike.highlights)}::jsonb,
        ${warehouse},
        true,
        ${quantity}
      )
    `;
    return;
  }

  await sql`
    INSERT INTO bike_stock (
      model_id,
      model_name,
      category,
      price_gbp,
      weight_kg,
      best_for,
      spec,
      warehouse,
      in_stock,
      quantity
    ) VALUES (
      ${bike.modelId},
      ${bike.name},
      ${bike.category},
      ${bike.priceGbp},
      ${bike.weightKg},
      ${bike.bestFor},
      ${bike.spec},
      ${warehouse},
      true,
      ${quantity}
    )
  `;
}

export async function seedBikeStock() {
  const sql = neon(process.env.DATABASE_URL!);
  const catalog = loadCatalog();

  await sql`DELETE FROM bike_stock`;

  let includeDisplayColumns = true;

  for (const bike of catalog) {
    for (const warehouse of WAREHOUSES) {
      try {
        await insertStockRow(
          sql,
          bike,
          warehouse,
          warehouse === "London" ? 8 : 4,
          includeDisplayColumns,
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (includeDisplayColumns && message.includes('column "image" does not exist')) {
          includeDisplayColumns = false;
          console.warn(
            "Display columns missing — run scripts/migrate-catalog.sql, then re-seed for image/description/highlights.",
          );
          await insertStockRow(
            sql,
            bike,
            warehouse,
            warehouse === "London" ? 8 : 4,
            false,
          );
        } else {
          throw err;
        }
      }
    }
  }

  console.log(
    `Seeded ${catalog.length * WAREHOUSES.length} bike_stock rows from data/bike-catalog.json`,
  );

  await triggerRevalidation();
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

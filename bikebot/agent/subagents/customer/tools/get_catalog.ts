import { defineTool } from "eve/tools";
import { z } from "zod";
import { neon } from "@neondatabase/serverless";

type CatalogRow = {
  model_name: string;
  category: string;
  price_gbp: number;
  weight_kg: number;
  best_for: string;
  spec: string | null;
};

export default defineTool({
  description:
    "Fetch the current Vur Selle bike lineup from the database, including model names, prices, weights, and use cases. Call this before making any bike recommendation.",
  inputSchema: z.object({}),
  async execute() {
    const sql = neon(process.env.DATABASE_URL!);

    // One row per model — pick the first warehouse row for catalog metadata.
    const rows = await sql<CatalogRow[]>`
      SELECT DISTINCT ON (model_name)
        model_name, category, price_gbp, weight_kg, best_for, spec
      FROM bike_stock
      WHERE price_gbp IS NOT NULL
      ORDER BY model_name, price_gbp ASC
    `;

    if (rows.length === 0) {
      return { models: [], message: "No bikes found in the catalog." };
    }

    return {
      models: rows.map((r) => ({
        name: r.model_name,
        category: r.category,
        priceGbp: r.price_gbp,
        weightKg: r.weight_kg,
        bestFor: r.best_for,
        spec: r.spec,
      })),
    };
  },
});

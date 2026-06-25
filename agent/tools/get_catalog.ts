import { defineTool } from "eve/tools";
import { z } from "zod";
import { neon } from "@neondatabase/serverless";

type CatalogRow = {
  model_id: string;
  model_name: string;
  category: string;
  price_gbp: number;
  weight_kg: number;
  best_for: string;
  spec: string | null;
  image?: string | null;
  description?: string | null;
  highlights?: string[] | null;
};

function isMissingDisplayColumnError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes('column "image" does not exist');
}

export default defineTool({
  description:
    "Fetch the current Vur Selle bike lineup from the database, including model IDs, names, prices, weights, and use cases. Call this before making any bike recommendation.",
  inputSchema: z.object({}),
  async execute() {
    const sql = neon(process.env.DATABASE_URL!);

    let rows: CatalogRow[];

    try {
      rows = (await sql`
        SELECT DISTINCT ON (model_id)
          model_id,
          model_name,
          category,
          price_gbp,
          weight_kg,
          best_for,
          spec,
          image,
          description,
          highlights
        FROM bike_stock
        WHERE price_gbp IS NOT NULL
        ORDER BY model_id, warehouse
      `) as CatalogRow[];
    } catch (err) {
      if (!isMissingDisplayColumnError(err)) throw err;

      rows = (await sql`
        SELECT DISTINCT ON (model_id)
          model_id,
          model_name,
          category,
          price_gbp,
          weight_kg,
          best_for,
          spec
        FROM bike_stock
        WHERE price_gbp IS NOT NULL
        ORDER BY model_id, warehouse
      `) as CatalogRow[];
    }

    if (rows.length === 0) {
      return { models: [], message: "No bikes found in the catalog." };
    }

    return {
      models: rows.map((r) => ({
        modelId: r.model_id,
        name: r.model_name,
        category: r.category,
        priceGbp: r.price_gbp,
        weightKg: Number(r.weight_kg),
        bestFor: r.best_for,
        spec: r.spec,
        image: r.image ?? null,
        description: r.description ?? null,
        highlights: Array.isArray(r.highlights) ? r.highlights : [],
      })),
    };
  },
});

import { defineTool } from "eve/tools";
import { z } from "zod";
import { neon } from "@neondatabase/serverless";

type StockRow = {
  model_name: string;
  region: string;
  warehouse: string;
  in_stock: boolean;
  quantity: number;
};

function normalise(s: string) {
  return s.toLowerCase().replace(/[-_]/g, " ").trim();
}

function resolveRegion(raw: string): string | null {
  const r = raw.toLowerCase().trim();
  if (["uk", "england", "britain", "united kingdom"].includes(r)) return "UK";
  return null;
}

export default defineTool({
  description:
    "Check whether a bike model is in stock for a given region and return the warehouse locations that carry it.",
  inputSchema: z.object({
    modelName: z
      .string()
      .describe("The bike model name, e.g. 'Meridian RD' or 'Volt EV'."),
    targetRegion: z
      .string()
      .describe("The sales region to check, e.g. 'UK' or 'France'."),
  }),
  async execute({ modelName, targetRegion }) {
    const region = resolveRegion(targetRegion);

    if (!region) {
      return {
        inStock: false,
        warehouses: [],
        message: `We currently only ship within the UK.`,
      };
    }

    const sql = neon(process.env.DATABASE_URL!);
    const slug = normalise(modelName);

    const rows = await sql<StockRow[]>`
      SELECT model_name, region, warehouse, in_stock, quantity
      FROM bike_stock
      WHERE lower(replace(replace(model_name, '-', ' '), '_', ' ')) = ${slug}
        AND region = ${region}
      ORDER BY warehouse
    `;

    if (rows.length === 0) {
      return {
        inStock: false,
        warehouses: [],
        message: `No stock record found for "${modelName}". Available models: Meridian RD, Summit TR, District CB, Volt EV.`,
      };
    }

    const inStockRows = rows.filter((r) => r.in_stock && r.quantity > 0);
    const warehouses = inStockRows.map((r) => `${r.warehouse} (qty: ${r.quantity})`);
    const inStock = inStockRows.length > 0;
    const displayName = rows[0].model_name;

    return {
      inStock,
      warehouses,
      message: inStock
        ? `${displayName} is in stock in ${region} at: ${warehouses.join(", ")}.`
        : `${displayName} is currently out of stock in ${region}.`,
    };
  },
});

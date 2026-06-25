import { defineTool } from "eve/tools";
import { z } from "zod";
import { neon } from "@neondatabase/serverless";

type StockRow = {
  model_id: string;
  model_name: string;
  warehouse: string;
  in_stock: boolean;
  quantity: number;
};

function normalise(s: string) {
  return s.toLowerCase().replace(/[-_]/g, " ").trim();
}

export default defineTool({
  description:
    "Check whether a bike model is in stock in the UK and return the warehouse locations that carry it.",
  inputSchema: z.object({
    modelId: z
      .string()
      .optional()
      .describe("Canonical model ID, e.g. 'meridian-rd' or 'volt-ev'."),
    modelName: z
      .string()
      .optional()
      .describe("The bike model name, e.g. 'Meridian RD' or 'Volt EV'."),
  }),
  async execute({ modelId, modelName }) {
    if (!modelId && !modelName) {
      return {
        inStock: false,
        warehouses: [],
        message: "Provide modelId or modelName. Use get_catalog to see available models.",
      };
    }

    const sql = neon(process.env.DATABASE_URL!);

    const rows = modelId
      ? ((await sql`
          SELECT model_id, model_name, warehouse, in_stock, quantity
          FROM bike_stock
          WHERE model_id = ${modelId}
          ORDER BY warehouse
        `) as StockRow[])
      : ((await sql`
          SELECT model_id, model_name, warehouse, in_stock, quantity
          FROM bike_stock
          WHERE lower(replace(replace(model_name, '-', ' '), '_', ' ')) = ${normalise(modelName!)}
          ORDER BY warehouse
        `) as StockRow[]);

    const label = modelId ?? modelName!;

    if (rows.length === 0) {
      return {
        inStock: false,
        warehouses: [],
        message: `No stock record found for "${label}". Use get_catalog to see available models.`,
      };
    }

    const inStockRows = rows.filter((r) => r.in_stock && r.quantity > 0);
    const warehouses = inStockRows.map((r) => `${r.warehouse} (qty: ${r.quantity})`);
    const inStock = inStockRows.length > 0;
    const displayName = rows[0].model_name;

    return {
      modelId: rows[0].model_id,
      inStock,
      warehouses,
      message: inStock
        ? `${displayName} is in stock at: ${warehouses.join(", ")}.`
        : `${displayName} is currently out of stock.`,
    };
  },
});

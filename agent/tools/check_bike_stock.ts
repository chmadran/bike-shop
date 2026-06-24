import { defineTool } from "eve/tools";
import { z } from "zod";
import { neon } from "@neondatabase/serverless";

type StockRow = {
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
    modelName: z
      .string()
      .describe("The bike model name, e.g. 'Meridian RD' or 'Volt EV'."),
  }),
  async execute({ modelName }) {
    const sql = neon(process.env.DATABASE_URL!);
    const slug = normalise(modelName);

    const rows = await sql<StockRow[]>`
      SELECT model_name, warehouse, in_stock, quantity
      FROM bike_stock
      WHERE lower(replace(replace(model_name, '-', ' '), '_', ' ')) = ${slug}
      ORDER BY warehouse
    `;

    if (rows.length === 0) {
      return {
        inStock: false,
        warehouses: [],
        message: `No stock record found for "${modelName}". Use get_catalog to see available models.`,
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
        ? `${displayName} is in stock at: ${warehouses.join(", ")}.`
        : `${displayName} is currently out of stock.`,
    };
  },
});

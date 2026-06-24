import { defineTool } from "eve/tools";
import { z } from "zod";
import { neon } from "@neondatabase/serverless";
import { embed, gateway } from "ai";

type FaqRow = {
  question: string;
  answer: string;
  similarity: number;
};

export default defineTool({
  description:
    "Search the FAQ database for answers to customer questions using semantic similarity. " +
    "Use this whenever a customer asks about shipping, returns, VAT, Cycle to Work, sizing, " +
    "warranty, or any policy question.",
  inputSchema: z.object({
    query: z.string().describe("The customer's question or topic to search for."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(5)
      .default(3)
      .describe("Number of FAQ results to return."),
  }),
  async execute({ query, limit }) {
    const sql = neon(process.env.DATABASE_URL!);

    const { embedding } = await embed({
      model: gateway.embeddingModel("openai/text-embedding-3-small"),
      value: query,
    });

    const vectorString = `[${embedding.join(",")}]`;

    const rows = await sql<FaqRow[]>`
      SELECT question, answer,
             1 - (embedding <=> ${vectorString}::vector) AS similarity
      FROM bike_faq
      WHERE region = 'UK'
      ORDER BY embedding <=> ${vectorString}::vector
      LIMIT ${limit}
    `;

    if (rows.length === 0) {
      return { results: [], message: "No relevant FAQ entries found." };
    }

    return {
      results: rows.map((r) => ({
        question: r.question,
        answer: r.answer,
        similarity: Math.round(r.similarity * 100) / 100,
      })),
    };
  },
});

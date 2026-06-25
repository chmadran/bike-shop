#!/usr/bin/env tsx
/**
 * Agent regression checks: RAG retrieval + live catalog prices.
 *
 * Usage: pnpm eval
 * Requires: DATABASE_URL, Vercel AI Gateway credentials (RAG cases only)
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";
import { embed, gateway } from "ai";
import { bikes } from "../lib/bikes";
import { loadLocalEnv } from "./load-env";

loadLocalEnv();

type FaqRow = {
  question: string;
  answer: string;
  similarity: number;
};

type RagCase = {
  id: string;
  kind: "rag";
  query: string;
  minSimilarity: number;
  mustInclude: string[];
  notes?: string;
};

type RoutingCase = {
  id: string;
  kind: "routing" | "scope";
  userMessage: string;
  expectTools?: string[];
  expectSkills?: string[];
  mustNotInclude?: string[];
  notes?: string;
};

type GoldenSet = {
  version: number;
  cases: Array<RagCase | RoutingCase>;
};

async function searchFaq(query: string, limit = 3): Promise<FaqRow[]> {
  const sql = neon(process.env.DATABASE_URL!);

  const { embedding } = await embed({
    model: gateway.embeddingModel("openai/text-embedding-3-small"),
    value: query,
  });

  const vectorString = `[${embedding.join(",")}]`;

  return (await sql`
    SELECT question, answer,
           1 - (embedding <=> ${vectorString}::vector) AS similarity
    FROM bike_faq
    ORDER BY embedding <=> ${vectorString}::vector
    LIMIT ${limit}
  `) as FaqRow[];
}

function includesAll(text: string, phrases: string[]): string[] {
  const lower = text.toLowerCase();
  return phrases.filter((p) => !lower.includes(p.toLowerCase()));
}

function loadGoldenSet(): GoldenSet {
  const path = join(process.cwd(), "eval/golden-set.json");
  return JSON.parse(readFileSync(path, "utf8")) as GoldenSet;
}

async function runRagCase(testCase: RagCase): Promise<{ pass: boolean; detail: string }> {
  const rows = await searchFaq(testCase.query);
  if (rows.length === 0) {
    return { pass: false, detail: "no FAQ rows returned — run `pnpm seed` first?" };
  }

  const top = rows[0];
  const combined = `${top.question} ${top.answer}`;

  if (top.similarity < testCase.minSimilarity) {
    return {
      pass: false,
      detail: `top similarity ${top.similarity.toFixed(3)} < ${testCase.minSimilarity}`,
    };
  }

  const missing = includesAll(combined, testCase.mustInclude);
  if (missing.length > 0) {
    return {
      pass: false,
      detail: `missing phrases: ${missing.join(", ")} (sim ${top.similarity.toFixed(3)})`,
    };
  }

  return {
    pass: true,
    detail: `sim ${top.similarity.toFixed(3)} · matched "${top.question.slice(0, 48)}…"`,
  };
}

type CatalogRow = {
  model_name: string;
  price_gbp: number;
};

/** Wrong prices the model might invent if it skips get_catalog. */
const HALLUCINATED_PRICES = [999, 1500, 1999, 2500, 2999, 3500, 5000];

async function fetchCatalog(): Promise<CatalogRow[]> {
  const sql = neon(process.env.DATABASE_URL!);
  return (await sql`
    SELECT DISTINCT ON (model_name)
      model_name, price_gbp
    FROM bike_stock
    WHERE price_gbp IS NOT NULL
    ORDER BY model_name, price_gbp ASC
  `) as CatalogRow[];
}

async function runCatalogPriceEval(): Promise<{ passed: number; total: number }> {
  const rows = await fetchCatalog();
  if (rows.length === 0) {
    console.log("  ✗ catalog-empty              no rows in bike_stock");
    return { passed: 0, total: 1 };
  }

  let passed = 0;
  const total = bikes.length + 1; // one row per canonical model + hallucination trap

  for (const bike of bikes) {
    const row = rows.find((r) => r.model_name === bike.name);
    if (!row) {
      console.log(`  ✗ ${bike.name.padEnd(28)} missing from bike_stock`);
      continue;
    }
    if (row.price_gbp !== bike.price) {
      console.log(
        `  ✗ ${bike.name.padEnd(28)} DB £${row.price_gbp} ≠ canonical £${bike.price}`,
      );
      continue;
    }
    console.log(`  ✓ ${bike.name.padEnd(28)} £${row.price_gbp} matches lib/bikes.ts`);
    passed++;
  }

  const catalogPrices = new Set(rows.map((r) => r.price_gbp));
  const strayHallucinations = HALLUCINATED_PRICES.filter((p) => catalogPrices.has(p));
  if (strayHallucinations.length > 0) {
    console.log(
      `  ✗ catalog-hallucination-trap   unexpected prices in DB: £${strayHallucinations.join(", £")}`,
    );
  } else {
    console.log("  ✓ catalog-hallucination-trap   no common wrong prices in live catalog");
    passed++;
  }

  return { passed, total };
}

function printManualRubric(cases: Array<RoutingCase>): void {
  console.log("\n── Manual agent rubric (run in live chat or during interview demo) ──\n");
  for (const c of cases) {
    console.log(`  [${c.kind}] ${c.id}`);
    console.log(`    Ask: "${c.userMessage}"`);
    if (c.expectTools?.length) console.log(`    Expect tools: ${c.expectTools.join(", ")}`);
    if (c.expectSkills?.length) console.log(`    Expect skills: ${c.expectSkills.join(", ")}`);
    if (c.mustNotInclude?.length) console.log(`    Must NOT include: ${c.mustNotInclude.join(", ")}`);
    if (c.notes) console.log(`    Note: ${c.notes}`);
    console.log("");
  }
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error(
      "DATABASE_URL is required. Add it to .env.local in the project root (run from bike-shop/).",
    );
    process.exit(1);
  }

  const golden = loadGoldenSet();
  const ragCases = golden.cases.filter((c): c is RagCase => c.kind === "rag");
  const manualCases = golden.cases.filter(
    (c): c is RoutingCase => c.kind === "routing" || c.kind === "scope",
  );

  console.log(`\nRAG evaluation — ${ragCases.length} automated cases\n`);

  let passed = 0;
  for (const testCase of ragCases) {
    const { pass, detail } = await runRagCase(testCase);
    const icon = pass ? "✓" : "✗";
    console.log(`  ${icon} ${testCase.id.padEnd(28)} ${detail}`);
    if (pass) passed++;
  }

  console.log(`\nResult: ${passed}/${ragCases.length} RAG cases passed`);

  console.log("\nCatalog price evaluation — anti-hallucination (get_catalog source of truth)\n");
  const catalog = await runCatalogPriceEval();
  console.log(`\nResult: ${catalog.passed}/${catalog.total} catalog checks passed`);

  printManualRubric(manualCases);

  const allPassed = passed === ragCases.length && catalog.passed === catalog.total;
  if (!allPassed) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

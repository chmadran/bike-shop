import { neon } from "@neondatabase/serverless";
import { embedMany, gateway } from "ai";
import { loadLocalEnv } from "./load-env";

loadLocalEnv();

const rawFAQs = [
  {
    question: "What are your domestic shipping options within the UK?",
    answer:
      "For all orders dispatched from our London hub to mainland UK addresses, we offer free next-business-day delivery via cargo freight. Orders must be placed before 2:00 PM GMT Monday through Thursday to qualify for next-day delivery. Delivery to the Scottish Highlands and Northern Ireland takes 2-3 business days.",
    region: "UK",
  },
  {
    question: "Is VAT included in the UK pricing, and are children's bikes exempt?",
    answer:
      "Yes, standard UK VAT of 20% is fully included in the listed price for all adult bicycles and gear. However, in accordance with UK tax laws, children's bicycles, helmets, and protective gear are zero-rated (0% VAT). The final price adjustment will apply automatically at checkout based on your basket composition.",
    region: "UK",
  },
  {
    question:
      "Can I buy a premium £3,500 bike like the Meridian RD through the UK Cycle to Work scheme, or is there a cap?",
    answer:
      "Yes, you can fully purchase the Meridian RD through our verified UK Cycle to Work retail partnership. While there were recent structural rumours regarding the reintroduction of a £1,000 threshold limit, the Chancellor explicitly confirmed in the Autumn Budget that the salary-sacrifice scheme remains completely uncapped. This means you can sacrifice your gross salary pre-tax across a 12-month payroll schedule for the entire value of premium road bikes, saving you up to 42% depending on your tax bracket.",
    region: "UK",
  },
  {
    question: "What is your return policy?",
    answer:
      "You can return any bike within 30 days for a full refund, as long as it is in resalable condition. Return shipping is included.",
    region: "UK",
  },
  {
    question: "Do I need to assemble the bike when it arrives?",
    answer:
      "Bikes arrive about 95% assembled. You will need to attach the pedals, straighten the handlebars, and check the tyre pressure. It takes around 15 minutes with the included tools.",
    region: "UK",
  },
];

export async function seedVectorDatabase() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log("Clearing bike_faq and generating embeddings via AI Gateway...");
  await sql`DELETE FROM bike_faq`;

  const { embeddings } = await embedMany({
    model: gateway.embeddingModel("openai/text-embedding-3-small"),
    values: rawFAQs.map((faq) => faq.answer),
  });

  console.log(`Inserting ${embeddings.length} FAQ vectors into Neon...`);

  for (let i = 0; i < rawFAQs.length; i++) {
    const faq = rawFAQs[i];
    const vectorString = `[${embeddings[i].join(",")}]`;

    await sql`
      INSERT INTO bike_faq (question, answer, region, embedding)
      VALUES (${faq.question}, ${faq.answer}, ${faq.region}, ${vectorString})
    `;
  }

  console.log("bike_faq seeded successfully.");
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is required in .env.local");
    process.exit(1);
  }
  await seedVectorDatabase();
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

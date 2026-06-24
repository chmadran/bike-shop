import { neon } from '@neondatabase/serverless';
import { embedMany, gateway } from 'ai'; // 1. Notice the 'gateway' import here!

const sql = neon(process.env.DATABASE_URL!);

const rawFAQs = [
    {
        question: "What are your domestic shipping options within the UK?",
        answer: "For all orders dispatched from our London hub to mainland UK addresses, we offer free next-business-day delivery via cargo freight. Orders must be placed before 2:00 PM GMT Monday through Thursday to qualify for next-day delivery. Delivery to the Scottish Highlands and Northern Ireland takes 2-3 business days.",
        region: "UK"
      },
      {
        question: "Is VAT included in the UK pricing, and are children's bikes exempt?",
        answer: "Yes, standard UK VAT of 20% is fully included in the listed price for all adult bicycles and gear. However, in accordance with UK tax laws, children's bicycles, helmets, and protective gear are zero-rated (0% VAT). The final price adjustment will apply automatically at checkout based on your basket composition.",
        region: "UK"
      },
    {
    question: "Can I buy a premium £3,500 bike like the Meridian RD through the UK Cycle to Work scheme, or is there a cap?",
    answer: "Yes, you can fully purchase the Meridian RD through our verified UK Cycle to Work retail partnership. While there were recent structural rumours regarding the reintroduction of a £1,000 threshold limit, the Chancellor explicitly confirmed in the Autumn Budget that the salary-sacrifice scheme remains completely uncapped. This means you can sacrifice your gross salary pre-tax across a 12-month payroll schedule for the entire value of premium road bikes, saving you up to 42% depending on your tax bracket.",
    region: "UK"
  }
];

export async function seedVectorDatabase() {
  console.log("Generating embeddings via Vercel AI Gateway...");

  // 2. Instead of openai.embeddingModel(), we target the gateway directly
  const { embeddings } = await embedMany({
    model: gateway.embeddingModel('openai/text-embedding-3-small'),
    values: rawFAQs.map(faq => faq.answer), 
  });

  console.log(`Successfully generated ${embeddings.length} vectors via Gateway. Inserting into Neon...`);

  for (let i = 0; i < rawFAQs.length; i++) {
    const faq = rawFAQs[i];
    
    // 1. Neon can take the array directly now when using tagged templates, 
    // but wrapping it in a pgvector bracket string explicitly guarantees compatibility.
    const vectorString = `[${embeddings[i].join(',')}]`; 

    // 2. Change the execution to use clean backticks. 
    // Neon automatically parameterizes these values behind the scenes safely!
    await sql`
      INSERT INTO bike_faq (question, answer, region, embedding)
      VALUES (${faq.question}, ${faq.answer}, ${faq.region}, ${vectorString});
    `;
  }

  console.log("Database successfully seeded via AI Gateway! 🚲");
}

if (require.main === module) {
  seedVectorDatabase().catch(console.error);
}
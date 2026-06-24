import { defineAgent } from "eve";

export default defineAgent({
  description:
    "Handles all customer-facing interactions: answering FAQ questions, checking bike stock, and recommending the right bike for a customer's needs.",
  model: "openai/gpt-4o-mini",
});

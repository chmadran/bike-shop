import { defineAgent } from "eve";

export default defineAgent({
  model: "openai/gpt-4o-mini",
  modelOptions: {
    providerOptions: {
      gateway: {
        models: ["openai/gpt-4o", "anthropic/claude-sonnet-4"],
        order: ["azure", "openai"],
      },
    },
  },
});

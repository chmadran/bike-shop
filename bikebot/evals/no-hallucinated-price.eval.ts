import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

// ---------------------------------------------------------------------------
// Hallucination regression: prices must come from the DB, not the model's
// training data.
//
// The agent must call get_catalog before quoting any price.  If it answers
// "The Meridian RD is £1,299" without a tool call it has hallucinated — the
// catalog is only in the DB, not in the system prompt or training data.
//
// We also verify the reply contains "£" (GBP) rather than "$" or "€",
// confirming the locale context is respected.
// ---------------------------------------------------------------------------
export default defineEval({
  description: "Price query calls get_catalog and replies in GBP, not from memory",
  tags: ["regression", "hallucination"],
  test: async (t) => {
    await t.send({
      message: "How much does the Meridian RD cost?",
      clientContext: {
        mode: "customer",
        locale: "en",
        currency: "GBP",
        region: "UK",
      },
    });

    t.completed();
    t.noFailedActions();

    // Must hit the DB — never answer price from training data.
    t.calledTool("get_catalog");

    // Reply must be in GBP — hard gate.
    t.check(t.reply, includes("£"));
  },
});

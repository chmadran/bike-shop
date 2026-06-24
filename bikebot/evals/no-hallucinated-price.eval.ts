import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

// ---------------------------------------------------------------------------
// Hallucination regression: prices must come from the DB, not the model's
// training data. The agent must call get_catalog before quoting any price,
// and must reply in GBP.
// ---------------------------------------------------------------------------
export default defineEval({
  description: "Price query calls get_catalog and replies in GBP, not from memory",
  tags: ["regression", "hallucination"],
  test: async (t) => {
    await t.send("How much does the Meridian RD cost?");

    t.completed();
    t.noFailedActions();
    t.calledTool("get_catalog");
    t.check(t.reply, includes("£"));
  },
});

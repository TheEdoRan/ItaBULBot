import {} from "dotenv/config.js";
import TG from "telegraf";
const { Telegraf } = TG;

import { showHelp, buildResults, showFiberData, showFWAData } from "./utils.js";

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.telegram
  .getMe()
  .then((info) => (bot.options.username = info.username))
  .catch((_) => {});

// Start/help command.
bot.command(["start", "aiuto"], (ctx) => {
  showHelp(ctx);
});

// Display cities/regions in inline query.
bot.on("inline_query", ({ inlineQuery, answerInlineQuery }) => {
  const results = buildResults(inlineQuery.query);
  return answerInlineQuery(results).catch((_) => {});
});

bot.on("chosen_inline_result", async (ctx) => {
  // City/region ID.
  const id = ctx.chosenInlineResult.result_id;

  // Display fiber data by default.
  showFiberData(id, ctx);
});

// Delete message on cancel button click.
bot.action("cancel_loading", ({ editMessageText, answerCbQuery }) => {
  editMessageText("❌  Ricerca annullata.")
    .catch((_) => {})
    .finally(answerCbQuery().catch((_) => {}));
});

// Show fiber details.
bot.action(/^show_fiber_details_\d+/, (ctx) => {
  const { data } = ctx.callbackQuery;
  const id = data.slice(data.lastIndexOf("_") + 1);

  showFiberData(id, ctx)
    .catch((_) => {})
    .finally(ctx.answerCbQuery().catch((_) => {}));
});

// Show FWA details.
bot.action(/^show_fwa_details_\d+/, (ctx) => {
  const { data } = ctx.callbackQuery;
  const id = data.slice(data.lastIndexOf("_") + 1);

  showFWAData(id, ctx)
    .catch((_) => {})
    .finally(ctx.answerCbQuery().catch((_) => {}));
});

bot.launch();

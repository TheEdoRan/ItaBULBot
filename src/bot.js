import {} from "dotenv/config.js";
import TG from "telegraf";
const { Telegraf } = TG;

import {
  showHelp,
  buildResults,
  showFiberData,
  showFWAData,
  cancelRequests,
} from "./utils.js";

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.telegram
  .getMe()
  .then((info) => (bot.options.username = info.username))
  .catch((_) => {});

// Start/help command.
bot.command(["start", "aiuto"], (ctx) => {
  return showHelp(ctx).catch((_) => {});
});

// Display cities/regions in inline query.
bot.on("inline_query", ({ inlineQuery, answerInlineQuery }) => {
  const results = buildResults(inlineQuery.query);
  return answerInlineQuery(results).catch((_) => {});
});

// User chose city or region.
bot.on("chosen_inline_result", (ctx) => {
  // City/region ID.
  const id = ctx.chosenInlineResult.result_id;

  // Display fiber data by default.
  return showFiberData(id, ctx).catch((_) => {});
});

// Delete message on cancel button click.
bot.action("cancel_loading", (ctx) => {
  const msgId = ctx.callbackQuery.inline_message_id;

  return ctx
    .editMessageText("❌  Ricerca annullata.")
    .then((_) => cancelRequests.add(msgId))
    .catch((_) => {})
    .finally(() => ctx.answerCbQuery().catch((_) => {}));
});

// Show fiber details.
bot.action(/^show_fiber_details_\d+/, (ctx) => {
  const { data } = ctx.callbackQuery;
  const id = data.slice(data.lastIndexOf("_") + 1);

  return showFiberData(id, ctx)
    .catch((_) => {})
    .finally(() => ctx.answerCbQuery().catch((_) => {}));
});

// Show FWA details.
bot.action(/^show_fwa_details_\d+/, (ctx) => {
  const { data } = ctx.callbackQuery;
  const id = data.slice(data.lastIndexOf("_") + 1);

  return showFWAData(id, ctx)
    .catch((_) => {})
    .finally(() => ctx.answerCbQuery().catch((_) => {}));
});

// If env is production, start webhook (Nginx as rev proxy).
// Otherwise just poll.
if (process.env.NODE_ENV === "production") {
  bot.telegram.setWebhook(`${process.env.DOMAIN_URL}/${process.env.BOT_TOKEN}`);

  bot.startWebhook(`/${process.env.BOT_TOKEN}`, null, process.env.HOOK_PORT);
} else {
  bot.launch();
}

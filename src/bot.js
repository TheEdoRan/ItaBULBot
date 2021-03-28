import {} from "dotenv/config.js";
import { Telegraf } from "telegraf";
import logger from "./logger.js";

import {
  getCityIdFromCityRegionNames,
  getInlineAddressSearchButton,
} from "./utils.js";

import {
  showHelp,
  buildResults,
  showFiberData,
  showFWAData,
  cancelRequests,
  showCityPCNData,
} from "./utils.js";

import { getAddressData, isUserSearching, setAddressData } from "./session.js";

const bot = new Telegraf(process.env.BOT_TOKEN);

// Only log when debugging.
if (process.env.DEBUG) {
  // Log to console.
  bot.use(logger);
}

// Start/help command (works for private chat only).
bot.command(
  ["start", "aiuto"],
  (ctx, next) => ctx.chat.type === "private" && next(),
  (ctx) => {
    const {
      message: { text: cmd },
    } = ctx;

    // City name and region name for address search, if present.
    const addressSearch = cmd.match(/^\/start\saddress_search_(.+)_(.+)$/);

    if (addressSearch) {
      const [_, cityName, regionName] = addressSearch;
      const cityId = getCityIdFromCityRegionNames(cityName, regionName);

      // If no city id, stop the process here (query not valid).
      if (!cityId) {
        return;
      }

      // Otherwise, reply to user asking for an address.
      ctx
        .reply(
          `Scrivi l'indirizzo che vuoi cercare per <b>${cityName}</b>, <i>${regionName}</i>:`,
          { parse_mode: "HTML" },
        )
        .catch((_) => {});

      // Put data into session.
      setAddressData(ctx.from.id, cityId, cityName, regionName);

      return;
    }

    return showHelp(ctx).catch((_) => {});
  },
);

// Text handler, works for private chat only and if user is doing an address
// search.
bot.on(
  "text",
  (ctx, next) => ctx.chat.type === "private" && next(),
  (ctx, next) => isUserSearching(ctx.from.id) && next(),
  (ctx) => {
    // TODO: handle request and delete user from map once done.
  },
);

// Display cities/regions in inline query.
bot.on("inline_query", (ctx) => {
  const results = buildResults(ctx.inlineQuery.query);

  return ctx
    .answerInlineQuery(results, getInlineAddressSearchButton(results))
    .catch((_) => {});
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
bot.action(/^show_fiber_details_(\d+)/, (ctx) => {
  const [id] = ctx.match.slice(1);

  return showFiberData(id, ctx)
    .catch((_) => {})
    .finally(() => ctx.answerCbQuery().catch((_) => {}));
});

// Show FWA details.
bot.action(/^show_fwa_details_(\d+)/, (ctx) => {
  const [id] = ctx.match.slice(1);

  return showFWAData(id, ctx)
    .catch((_) => {})
    .finally(() => ctx.answerCbQuery().catch((_) => {}));
});

// Show PCN details.
bot.action(/^show_pcn_details_(.+)_(\d+)/, (ctx) => {
  const [prevStatus, cityId] = ctx.match.slice(1);

  return showCityPCNData(prevStatus, cityId, ctx)
    .catch((_) => {})
    .finally(() => ctx.answerCbQuery().catch((_) => {}));
});

// Launch bot
bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

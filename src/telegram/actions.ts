import type { Telegraf, Context } from "telegraf";
import type { Update } from "typegram";

export const handleActions = (bot: Telegraf<Context<Update>>) => {
  // Fiber details handler
  // \d+: city/region id.
  bot.action(/^show_fiber_details_(\d+)/, (ctx) => {
    // TODO: Implement fiber action handler.
  });

  // FWA details handler.
  // \d+: city/region id.
  bot.action(/^show_fwa_details_(\d+)/, (ctx) => {
    // TODO: Implement FWA action handler.
  });

  // PCN details handler.
  // \w: previous status (fiber/FWA).
  // \d+: city id.
  bot.action(/^show_pcn_details_(\w)_(\d+)/, (ctx) => {
    // TODO: Implement PCN action handler.
  });
};

import type { Telegraf, Context } from "telegraf";
import type { Update } from "typegram";
import { showFiberData, showFwaData, showPcnData } from "../show";

export const handleActions = (bot: Telegraf<Context<Update>>) => {
  // Wait button handler.
  // Don't do anything (user shouldn't press the button), but we handle it
  // so the query gets processed anyway.
  bot.action(/^_wait_for_info$/, (ctx) => ctx.answerCbQuery().catch((_) => {}));

  // Fiber details handler.
  // \d+: city/region id.
  bot.action(/^show_fiber_details_(\d+)$/, async (ctx) => {
    await showFiberData(ctx);
    ctx.answerCbQuery().catch((_) => {});
  });

  // FWA details handler.
  // \d+: city/region id.
  bot.action(/^show_fwa_details_(\d+)$/, async (ctx) => {
    await showFwaData(ctx);
    ctx.answerCbQuery().catch((_) => {});
  });

  // PCN details handler.
  // \w+: previous status (fiber/FWA).
  // \d+: city id.
  bot.action(/^show_pcn_details_(\w+)_(\d+)$/, async (ctx) => {
    await showPcnData(ctx);
    ctx.answerCbQuery().catch((_) => {});
  });
};

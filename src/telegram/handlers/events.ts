import type { Telegraf, Context } from "telegraf";
import type { Update } from "typegram";
import type { ExtraAnswerInlineQuery } from "telegraf/typings/telegram-types";

import { buildInlineResults } from "../../data/utils";
import { showAddressData, showFiberData } from "../show";
import { BotActionContext } from "../types";

export const handleEvents = (bot: Telegraf<Context<Update>>) => {
  bot.on("inline_query", async (ctx) => {
    const { results, addressHowTo } = await buildInlineResults(
      ctx.inlineQuery.query
    );

    // Cache results for 1 hour.
    let msgExtra: ExtraAnswerInlineQuery = { cache_time: 3600 };

    if (addressHowTo) {
      msgExtra = {
        ...msgExtra,
        switch_pm_text: "🔍  Scopri come cercare un indirizzo",
        switch_pm_parameter: "address_search",
      };
    }
    await ctx.answerInlineQuery(results, msgExtra).catch((_) => {});
  });

  bot.on("chosen_inline_result", (ctx) => {
    // If address search, show address data.
    if (ctx.chosenInlineResult.result_id.startsWith("address_")) {
      return showAddressData(ctx);
    }

    // Otherwise, show fiber data (default page).
    showFiberData(ctx as BotActionContext);
  });
};

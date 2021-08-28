import type { Telegraf, Context } from "telegraf";
import type { Update } from "typegram";

export const handleEvents = (bot: Telegraf<Context<Update>>) => {
  bot.on("inline_query", (ctx) => {
    // TODO: Implement inline_query event handler.
  });

  bot.on("chosen_inline_result", (ctx) => {
    // TODO: Implement chosen_inline_result event handler.
  });
};

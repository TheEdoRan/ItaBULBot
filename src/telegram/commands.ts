import type { Telegraf, Context } from "telegraf";
import type { Update } from "typegram";
import { Markup } from "telegraf";

import { replyToMessage } from "./utils";
import { startHelpCommand, addressCommand } from "../format/commands";

// Private chat only middleware.
const isPrivateChat = (ctx: Context, next: () => Promise<void>) => {
  ctx.chat?.type === "private" && next();
};

export const handleCommands = (bot: Telegraf<Context<Update>>) => {
  bot.command(["start", "aiuto"], isPrivateChat, (ctx) => {
    const firstName = ctx.from.first_name;

    // Check if we're redirected here because of an address search.
    const addressSearch = ctx.message.text.endsWith("address_search");

    // If so, display the address search message.
    if (addressSearch) {
      replyToMessage(ctx, addressCommand(firstName));
      return;
    }

    // Otherwise, display the standard show/help message.
    replyToMessage(ctx, startHelpCommand(firstName));
  });

  bot.command("indirizzo", isPrivateChat, (ctx) => {
    replyToMessage(
      ctx,
      addressCommand(ctx.from.first_name),
      Markup.inlineKeyboard([
        Markup.button.switchToCurrentChat(
          "🔍  Cerca un comune, una regione o un indirizzo",
          ""
        ),
      ])
    );
  });
};

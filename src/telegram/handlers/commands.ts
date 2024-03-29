import { Markup } from "telegraf";

import { addressCommand, startHelpCommand } from "../../format/commands";
import { StartHelpButton } from "../buttons";
import { replyToMessage } from "../utils";

import type { Context, Telegraf } from "telegraf";
import type { Update } from "typegram";

// Private chat only middleware.
const isPrivateChat = (ctx: Context, next: () => Promise<void>) => {
	if (ctx.chat?.type === "private") {
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		next();
	}
};

export const handleCommands = (bot: Telegraf<Context<Update>>) => {
	bot.command(["start", "aiuto"], isPrivateChat, (ctx) => {
		const firstName = ctx.from.first_name;

		const buttons = [StartHelpButton()];

		// Check if we're redirected here because of an address search.
		const addressSearch = ctx.message.text.endsWith("address_search");

		// If so, display the address search message.
		if (addressSearch) {
			replyToMessage(
				ctx,
				addressCommand(firstName),
				Markup.inlineKeyboard(buttons)
			);
			return;
		}

		// Otherwise, display the standard show/help message.
		replyToMessage(
			ctx,
			startHelpCommand(firstName),
			Markup.inlineKeyboard(buttons)
		);
	});

	bot.command("indirizzo", isPrivateChat, (ctx) => {
		const buttons = [StartHelpButton()];

		replyToMessage(
			ctx,
			addressCommand(ctx.from.first_name),
			Markup.inlineKeyboard(buttons)
		);
	});
};

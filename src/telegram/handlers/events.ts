import { buildInlineResults } from "../../data/utils";
import { showAddressData, showFiberData } from "../show";
import type { BotActionContext } from "../types";

import type { Context, Telegraf } from "telegraf";
import type { ExtraAnswerInlineQuery } from "telegraf/typings/telegram-types";
import type { Update } from "typegram";

export const handleEvents = (bot: Telegraf<Context<Update>>) => {
	bot.on("inline_query", async (ctx) => {
		const { results, addressHowTo } = await buildInlineResults(
			ctx.inlineQuery.query
		);

		// Cache inline results for 6 hours.
		let msgExtra: ExtraAnswerInlineQuery = { cache_time: 21600 };

		if (addressHowTo) {
			msgExtra = {
				...msgExtra,
				switch_pm_text: "🔍  Scopri come cercare un indirizzo",
				switch_pm_parameter: "address_search",
			};
		}
		await ctx.answerInlineQuery(results, msgExtra).catch(() => {
			return undefined;
		});
	});

	bot.on("chosen_inline_result", async (ctx) => {
		// If address search, show address data.
		if (ctx.chosenInlineResult.result_id.startsWith("address_")) {
			await showAddressData(ctx);
			return;
		}

		// Otherwise, show fiber data (default page).
		await showFiberData(ctx as BotActionContext);
	});
};

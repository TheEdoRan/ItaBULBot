import type { Context, MiddlewareFn } from "telegraf";
import type { Message, Update } from "typegram";

export const logger = (): MiddlewareFn<Context<Update>> => {
	return (ctx, next) => {
		const textMessage = ctx.message as Message.TextMessage;

		if (
			!ctx.from ||
			(!textMessage &&
				!ctx.inlineQuery &&
				!ctx.chosenInlineResult &&
				!ctx.callbackQuery)
		) {
			return next();
		}

		// Try to get message info.
		let msgInfo = "";

		if (ctx.inlineQuery) {
			msgInfo = ctx.inlineQuery.query;
		} else if (ctx.chosenInlineResult) {
			msgInfo = `chosen -> ${ctx.chosenInlineResult.result_id}`;
		} else {
			msgInfo =
				ctx.callbackQuery && "data" in ctx.callbackQuery
					? ctx.callbackQuery.data
					: textMessage.text;
		}

		// If empty string, skip logging.
		if (!msgInfo) {
			return next();
		}

		const {
			first_name: firstName,
			last_name: lastName,
			username,
		} = ctx.from;

		// User info.
		let format = firstName;
		format += lastName ? ` ${lastName}` : "";
		format += username ? ` [@${username}]` : "";
		format += ": ";

		// Message info.
		format += msgInfo;

		// Log to console.
		console.log(format);

		return next();
	};
};

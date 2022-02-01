import type { Context, MiddlewareFn } from "telegraf";
import type { CallbackQuery, Message, Update } from "typegram";

export const logger = (): MiddlewareFn<Context<Update>> => (ctx, next) => {
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
	const msgInfo = (
		ctx.inlineQuery?.query ||
		(ctx.chosenInlineResult
			? `chosen -> ${ctx.chosenInlineResult.result_id}`
			: "") ||
		(ctx.callbackQuery as CallbackQuery.DataCallbackQuery)?.data ||
		textMessage?.text ||
		""
	)?.toString();

	// If empty string, skip logging.
	if (!msgInfo) {
		return next();
	}

	const { first_name: firstName, last_name: lastName, username } = ctx.from;

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

import type { Context, MiddlewareFn } from "telegraf";
import type { CallbackQuery, Message, Update } from "typegram";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

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
    let format = `[${dayjs.utc().format("YYYY-MM-DD HH:mm:ss")}] `;
    format += firstName;
    format += lastName ? ` ${lastName}` : "";
    format += username ? ` [@${username}]` : "";
    format += ": ";

    // Message info.
    format += msgInfo;

    // Log to console.
    console.log(format);

    next();
  };
};

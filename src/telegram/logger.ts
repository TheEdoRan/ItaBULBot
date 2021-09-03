import type { Context, MiddlewareFn } from "telegraf";
import type { Update } from "typegram";

export const logger = (): MiddlewareFn<Context<Update>> => {
  return (ctx, next) => {
    if (
      !ctx.from ||
      (!ctx.message && !ctx.inlineQuery && !ctx.chosenInlineResult)
    ) {
      return next();
    }

    // Try to get message info.
    const msgInfo = (
      ctx.message ||
      ctx.inlineQuery?.query ||
      ctx.chosenInlineResult?.query ||
      ""
    )?.toString();

    // If empty string, skip logging.
    if (!msgInfo.length) {
      return next();
    }

    const { first_name: firstName, last_name: lastName, username } = ctx.from;

    // User info.
    let format = firstName;
    format += lastName ? ` ${lastName}` : "";
    format += username ? ` [${username}]` : "";
    format += ": ";

    // Message info.
    format += msgInfo;

    // Log to console.
    console.log(format);

    next();
  };
};

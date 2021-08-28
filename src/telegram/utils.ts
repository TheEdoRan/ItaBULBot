import type { Context, Markup } from "telegraf";
import type { InlineKeyboardMarkup } from "typegram";

// Enhanced ctx.reply function, with sensible extra options, and optional
// inline keyboard.
export const replyToMessage = (
  ctx: Context,
  text: string,
  inlineKeyboard?: Markup.Markup<InlineKeyboardMarkup>
) => {
  try {
    ctx.reply(text, {
      disable_web_page_preview: true,
      parse_mode: "HTML",
      allow_sending_without_reply: true,
      reply_to_message_id: ctx.message?.message_id,
      ...inlineKeyboard,
    });
  } catch (e) {
    console.error(e);
  }
};

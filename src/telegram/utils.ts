import type { Context, Markup } from "telegraf";
import type { InlineKeyboardMarkup } from "typegram";
import type {
  ExtraEditMessageText,
  ExtraReplyMessage,
} from "telegraf/typings/telegram-types";

import { showLatestUpdate } from "./show";

const baseExtraOpts: ExtraReplyMessage & ExtraEditMessageText = {
  disable_web_page_preview: true,
  parse_mode: "HTML",
};

// Custom ctx.reply function, with sensible extra options and optional
// inline keyboard.
export const replyToMessage = (
  ctx: Context,
  text: string,
  inlineKeyboard?: Markup.Markup<InlineKeyboardMarkup>
) => {
  ctx
    .reply(text, {
      ...baseExtraOpts,
      allow_sending_without_reply: true,
      reply_to_message_id: ctx.message?.message_id,
      reply_markup: inlineKeyboard?.reply_markup,
    })
    .catch((_) => {});
};

// Operation error when editing message or when data fetching failed.
// Edit the message with this error.
export const editMessageWithError = (ctx: Context) =>
  ctx
    .editMessageText(
      "😕  <i>Qualcosa è andato storto nell'eseguire l'operazione.</i>",
      baseExtraOpts
    )
    .catch(() => {});

// Custom ctx.editMessageText function, with sensible extra options and optional
// inline keyboard.
export const editMessage = async (
  ctx: Context,
  text: string,
  inlineKeyboard?: Markup.Markup<InlineKeyboardMarkup>,
  latestUpdate: boolean = true
) => {
  ctx
    .editMessageText(`${text}${latestUpdate ? await showLatestUpdate() : ""}`, {
      ...baseExtraOpts,
      reply_markup: inlineKeyboard?.reply_markup,
    })
    .catch((_) => {});
};

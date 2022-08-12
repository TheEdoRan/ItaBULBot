import type { Context } from "telegraf";
import type { Update } from "typegram";

export type BotActionContext = Context<Update> & { match: RegExpExecArray };

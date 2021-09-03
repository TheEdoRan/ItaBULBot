import { Context } from "telegraf";
import { Update } from "typegram";

export type BotActionContext = Context<Update> & { match: RegExpExecArray };

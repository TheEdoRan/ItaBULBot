import "dotenv/config";
import "./resolve";

import { Telegraf } from "telegraf";

import {
	handleActions,
	handleCommands,
	handleEvents,
} from "./telegram/handlers";
import { logger } from "./telegram/logger";

const bot = new Telegraf(process.env.BOT_TOKEN as string);

// Only for debugging purposes.
if (process.env.DEBUG === "true") {
	bot.use(logger());
}

handleCommands(bot);
handleEvents(bot);
handleActions(bot);

bot.launch().catch(() => undefined);

console.info("bot started");

// Graceful stop.
process.once("SIGINT", () => {
	bot.stop("SIGINT");
	console.info("bot and server gracefully stopped");
});

process.once("SIGTERM", () => {
	bot.stop("SIGTERM");
	console.info("bot and server gracefully stopped");
});

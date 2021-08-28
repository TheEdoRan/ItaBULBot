import "dotenv/config";
import { Telegraf } from "telegraf";
import updateLogger from "telegraf-update-logger";

import { handleCommands } from "./telegram/commands";

const bot = new Telegraf(process.env.BOT_TOKEN as string);

// Logging middleware.
bot.use(updateLogger({ colors: true }));

// Command handlers.
handleCommands(bot);

// Event handlers.

// Action handlers.

// Start bot.
bot.launch();

// Graceful stop.
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

import "dotenv/config";
import { Telegraf } from "telegraf";

import {
  handleCommands,
  handleEvents,
  handleActions,
} from "./telegram/handlers";
import { logger } from "./telegram/logger";

const bot = new Telegraf(process.env.BOT_TOKEN as string);

// Only for debugging purposes.
if (process.env.DEBUG) {
  // Logging middleware.
  bot.use(logger());
}

// Command handlers.
handleCommands(bot);

// Event handlers.
handleEvents(bot);

// Action handlers.
handleActions(bot);

// Start bot.
bot.launch();

// Graceful stop.
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

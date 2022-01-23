import "dotenv/config";
import { Telegraf } from "telegraf";
import {
  handleActions,
  handleCommands,
  handleEvents,
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

// Launch bot.
if (process.env.NODE_ENV === "production") {
  bot.launch({
    webhook: {
      domain: process.env.WEBHOOK_URL as string,
      port: 8080,
    },
  });
} else {
  bot.launch();
}

// Graceful stop.
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

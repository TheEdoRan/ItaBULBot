import "dotenv/config";
import http from "http";
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

// Start bot.
bot.launch();

// Graceful stop.
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// Healthcheck for fly.
http
  .createServer((req, res) => {
    res.writeHead(200);
    res.end("ok");
  })
  .listen(8080);

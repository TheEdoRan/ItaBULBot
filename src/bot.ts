import "dotenv/config";
import { createServer } from "http";
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
  // Logging middleware.
  bot.use(logger());
}

// Command handlers.
handleCommands(bot);

// Event handlers.
handleEvents(bot);

// Action handlers.
handleActions(bot);

bot.launch();

// fly healthcheck.
const server = createServer((_, res) => {
  res.writeHead(200);
  res.end("ok");
});

server.listen(8080);

// Graceful stop.
process.once("SIGINT", () => {
  bot.stop("SIGINT");
  server.close();
});

process.once("SIGTERM", () => {
  bot.stop("SIGTERM");
  server.close();
});

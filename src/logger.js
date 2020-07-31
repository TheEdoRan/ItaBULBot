import TelegrafLogger from "telegraf-logger";
import chalk from "chalk";

// Colorize output and export middleware.
export default new TelegrafLogger({
  format: `${chalk.green("%ut")} => ${chalk.inverse("%fi")} ${chalk.cyan(
    "%fn %ln",
  )} ${chalk.red("@%u")}: %c`,
}).middleware();

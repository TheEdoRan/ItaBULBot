import Markup from "telegraf/markup.js";

import { cities, regions } from "./init.js";
import { buildFiberData, buildFWAData } from "./data.js";

const substring = (s1, s2) => s1.toLowerCase().includes(s2.toLowerCase());

const replyExtra = { parse_mode: "HTML" };

// Template for query result.
const buildResult = (id, title, description) => ({
  type: "article",
  id,
  title,
  description,
  input_message_content: {
    message_text: "_Scaricando informazioni..._",
    parse_mode: "Markdown",
  },
  reply_markup: Markup.inlineKeyboard([
    Markup.callbackButton("❌  Cancella operazione", "cancel_loading"),
  ]),
});

// Filter arrays based on query and build query results array, returning the
// first 50 results.
export const buildResults = (query) =>
  [
    ...regions
      .filter((r) => substring(r.name, query))
      .map((r) => buildResult(r.id, r.name, "Regione")),
    ...cities
      .filter((c) => substring(c.name, query))
      .map((c) => buildResult(c.id, c.name, c.region_name)),
  ]
    .sort((a, b) => a.title.length - b.title.length)
    .slice(0, 50);

export const showFiberData = async (id, ctx) => {
  try {
    const data = await buildFiberData(id);

    // Update message with data.
    ctx.editMessageText(data, {
      ...replyExtra,
      reply_markup: Markup.inlineKeyboard([
        Markup.callbackButton(
          "📡  Mostra informazioni su FWA",
          `show_fwa_details_${id}`,
        ),
      ]),
    });
  } catch (error) {
    ctx.editMessageText(
      "😕  <i>Errore nell'eseguire l'operazione.</i>",
      replyExtra,
    );
  }
};

export const showFWAData = async (id, ctx) => {
  try {
    const data = await buildFWAData(id);

    // Update message with data.
    ctx.editMessageText(data, {
      ...replyExtra,
      reply_markup: Markup.inlineKeyboard([
        Markup.callbackButton(
          "🌐  Mostra informazioni su fibra ottica",
          `show_fiber_details_${id}`,
        ),
      ]),
    });
  } catch (error) {
    ctx.editMessageText(
      "😕 <i>Errore nell'eseguire l'operazione.</i>",
      replyExtra,
    );
  }
};

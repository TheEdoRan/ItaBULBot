import { Markup } from "telegraf";
import type { InlineQueryResultArticle } from "typegram";

import * as cities from "./json/cities.json";
import * as regions from "./json/regions.json";

// Search for substring.
const substring = (s1: string, s2: string) =>
  s1.toLowerCase().includes(s2.toLowerCase());

// Template for city/region result.
const buildInlineCityRegionResult = (
  id: number,
  title: string,
  description?: string
): InlineQueryResultArticle => ({
  type: "article",
  id: id.toString(),
  title,
  description,
  input_message_content: {
    message_text: "<i>Scaricando informazioni...</i>",
    parse_mode: "HTML",
  },
  ...Markup.inlineKeyboard([
    Markup.button.callback("❌  Cancella operazione", "cancel_loading"),
  ]),
});

// Build results for cities, regions or addresses, based on query.
export const buildInlineResults = async (
  query: string
): Promise<{ results: InlineQueryResultArticle[]; addressSearch: boolean }> => {
  // Higher priority to city/region search.
  let results = [
    ...regions
      .filter((r) => substring(r.name, query))
      .map((r) => buildInlineCityRegionResult(r.id, r.name, "Regione")),
    ...cities
      .filter((c) => substring(c.name, query))
      .map((c) => buildInlineCityRegionResult(c.id, c.name, c.region_name)),
  ]
    .sort((a, b) => a.title.length - b.title.length)
    .slice(0, 10);

  //FIXME: Finish implementation.
  return { results, addressSearch: false };
};

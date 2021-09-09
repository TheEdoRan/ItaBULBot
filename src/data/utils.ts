import { Markup } from "telegraf";
import type { InlineQueryResultArticle } from "typegram";

import regions from "./json/regions.json";
import cities from "./json/cities.json";

import type { CityRegionLevel } from "./types";
import { Fetch } from "./fetch";
import { substring } from "../utils";

export const getLevel = (id: string): CityRegionLevel =>
  parseInt(id) > 21 ? "city" : "region";

export const getCityIdFromName = (cityName: string): number | undefined =>
  cities.find((c) => c.name.toLowerCase() === cityName.toLowerCase())?.id;

export const getRegionIdFromCityId = (cityId: string): string | undefined => {
  const regionName = cities.find(
    (c) => c.id.toString() === cityId
  )?.region_name;
  const regionId = regions.find((r) => r.name === regionName)?.id;

  return regionId?.toString();
};

// Template for city/region result.
const buildInlineResult = (
  id: number | string,
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
    Markup.button.callback("🕙  Attendi", "_wait_for_info"),
  ]),
});

// Build results for cities, regions or addresses, based on query.
export const buildInlineResults = async (
  query: string
): Promise<{ results: InlineQueryResultArticle[]; addressHowTo: boolean }> => {
  // Higher priority for city/region search.
  let results = [
    ...regions
      .filter((r) => substring(r.name, query))
      .map((r) => buildInlineResult(r.id, r.name, "Regione")),
    ...cities
      .filter((c) => substring(c.name, query))
      .map((c) => buildInlineResult(c.id, c.name, c.region_name)),
  ]
    .sort((a, b) => a.title.length - b.title.length)
    .slice(0, 10);

  // If no city/region matches, switch to address search.
  if (!results.length) {
    // Query API.
    try {
      const addresses = await Fetch.searchAddresses(query);

      results = addresses
        .filter((a) => a.level === "street" && a.number)
        .map(({ id: streetId, street, number, city, province, exponent }) => {
          const exponentString = exponent ? `/${exponent.toUpperCase()}` : "";

          return buildInlineResult(
            `address_${getCityIdFromName(
              city
            )}_${streetId}_${province}_${number}${exponentString}`,
            `${street}, ${number}${exponentString}`,
            `${city} (${province})`
          );
        });

      // Return addresses result.
      // Show how-to button if no addresses found, otherwise don't show it.
      return { results, addressHowTo: !results.length };
      // If any errors, return empty array and display how-to button.
    } catch (e) {
      return { results: [], addressHowTo: true };
    }
  }

  // Return results and true flag (cities/regions search, we need to display
  // how-to button).
  return { results, addressHowTo: true };
};

import { Markup } from "telegraf";
import { FiberFwa } from "../data/types";

export const StartHelpButton = () =>
  Markup.button.switchToCurrentChat(
    "🔍  Cerca un comune, una regione o un indirizzo",
    ""
  );

export const FiberButton = (id: string) =>
  Markup.button.callback("🌐  Dettagli fibra", `show_fiber_details_${id}`);

export const FwaButton = (id: string) =>
  Markup.button.callback("📡  Dettagli FWA", `show_fwa_details_${id}`);

export const PcnButton = (id: string, prevStatus: FiberFwa) =>
  Markup.button.callback(
    "🗄️  Dettagli PCN",
    `show_pcn_details_${prevStatus}_${id}`
  );

export const PcnLocalizeButton = ({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) =>
  Markup.button.url(
    "🗺  Localizza sulla mappa",
    `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
  );

export const GoBackButton = (id: string, prevStatus: FiberFwa) =>
  Markup.button.callback(
    "◀️  Torna indietro",
    `show_${prevStatus}_details_${id}`
  );

export const BulButton = (
  id: string | { regionId: string; cityId: string; egonId: string },
  context: FiberFwa | "pcn" | "address"
) => {
  // Default append for region/city and fiber/FWA/PCN.
  let append = "/mappa/?entity=";

  switch (context) {
    case "fiber":
      append += `${id}&indicator=fiber`;
      break;
    case "fwa":
      append += `${id}&indicator=wireless`;
      break;
    case "pcn":
      append += `${id}&pcn=1`;
      break;
    // Address.
    default:
      // Should not be.
      if (typeof id === "string") {
        throw new Error(
          "Address context needs region id, city id and egon id."
        );
      }

      append = `/indirizzo/?address=region-${id.regionId}_city-${id.cityId}_street-${id.egonId}`;
  }

  return Markup.button.url(
    "🔗  Visualizza sul sito BUL",
    `https://bandaultralarga.italia.it/${append}`
  );
};
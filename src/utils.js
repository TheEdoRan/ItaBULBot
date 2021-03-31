import { Markup } from "telegraf";
import escape from "html-escape";

import { cities, regions } from "./init.js";
import {
  fetchAddresses,
  fetchEgonId,
  buildFiberData,
  buildFWAData,
  buildCityPCNData,
  buildShelterMapUrl,
  buildAddressData,
  buildAddressInfoUrl,
} from "./data.js";

const substring = (s1, s2) => s1.toLowerCase().includes(s2.toLowerCase());

export const getLevel = (id) => (parseInt(id) > 21 ? "city" : "region");

// Extra Telegram options for message edit/send.
const msgExtra = { parse_mode: "HTML", disable_web_page_preview: true };

// Set containing pending cancel requests.
export const cancelRequests = new Set();

// Get city id from name.
const getCityIdFromName = (cityName) =>
  cities.find((c) => c.name.toLowerCase() === cityName.toLowerCase())?.id;

// Get region id from city id.
const getRegionIdFromCityId = (cityId) => {
  const regionName = cities.find((c) => c.id === parseInt(cityId)).region_name;
  const regionId = regions.find((r) => r.name === regionName).id;

  return regionId;
};

// Template for query result.
const buildResult = (id, title, description = "") => ({
  type: "article",
  id,
  title,
  description,
  input_message_content: {
    message_text: "<i>Scaricando informazioni...</i>",
    ...msgExtra,
  },
  ...Markup.inlineKeyboard([
    Markup.button.callback("❌  Cancella operazione", "cancel_loading"),
  ]),
});

// Filter arrays based on query and build query results array, returning the
// first 10 results (for city/region search).
export const buildResults = async (query) => {
  // Higher priority to city/region search.
  let results = [
    ...regions
      .filter((r) => substring(r.name, query))
      .map((r) => buildResult(r.id, r.name, "Regione")),
    ...cities
      .filter((c) => substring(c.name, query))
      .map((c) => buildResult(c.id, c.name, c.region_name)),
  ]
    .sort((a, b) => a.title.length - b.title.length)
    .slice(0, 10);

  // If no city/region matches, switch to address search.
  if (!results.length) {
    // Query API.
    const addresses = await fetchAddresses(query);

    try {
      results = addresses
        .filter((a) => a.level === "street" && a.number)
        .map(({ id: streetId, street, number, city, province, exponent }) =>
          buildResult(
            `address_${getCityIdFromName(city)}_${streetId}_${number}${
              exponent ? "/" + exponent.toUpperCase() : ""
            }`,
            `${street}, ${number}${
              exponent ? "/" + exponent.toUpperCase() : ""
            }`,
            `${city} (${province})`,
          ),
        );
    } catch (_) {
      // If any errors processing the address, return empty array with
      // true how-to address search flag.
      return [[], true];
    }

    // Return results and false flag (address search, no need to display
    // the address search how-to button).
    return [results, false];
  }

  // Return results and true flag (no address search, we need to display
  // how-to button).
  return [results, true];
};

const showOpError = (ctx) =>
  ctx
    .editMessageText("😕  <i>Errore nell'eseguire l'operazione.</i>", msgExtra)
    .catch(() => {});

// For /start and /aiuto.
export const showHelp = async (ctx) => {
  const msg = `
Ciao <b>${escape(ctx.from.first_name)}</b> 👋!

Questo bot ti aiuterà a scoprire qual è lo stato dei lavori di fibra ottica/FWA, finanziati dal progetto <i>BandaUltraLarga</i> (<b>#BUL</b>) in una determinata regione o città, da te scelta.

<b>Funzionamento</b>  🔍
Il bot è <b>inline</b>, ovvero funziona in <b>qualsiasi chat</b>, non ha bisogno di comandi in privato per mostrarti le informazioni. Puoi utilizzarlo in conversazioni dirette con altre persone, oppure in gruppi/supergruppi.

Ti basterà digitare l'username del bot stesso, seguito dal termine di ricerca, due esempi pratici:

<code>@itabulbot Roma</code>
<code>@itabulbot Lombardia</code>

Nella finestrella che si apre, basterà premere sulla città o regione corrispondente ed il bot penserà al resto.

<b>Novità</b> ❗️ 
Il bot ora supporta anche la <b>ricerca per indirizzo</b>. Lancia il comando /indirizzo per più informazioni.

<b>Comandi</b>  🖋
/aiuto - Mostra questo messaggio.
/indirizzo - Mostra l'aiuto per la ricerca ad indirizzo.

<b>FAQ</b> ❓
• <b>Il bot ruba i miei dati personali?</b> <i>No, tranquillo, siamo dalla tua parte.</i>

<b>Contributo</b>  📖
Il bot è <b>free</b> ed <b>open source</b>, rilasciato sotto licenza <a href="https://www.gnu.org/licenses/gpl-3.0.html">GNU GPLv3</a>.
Il codice sorgente e la relativa documentazione si possono trovare a <a href="https://github.com/theedoran/itabulbot">questo indirizzo</a>.

<b>Contatti</b>  👤
Sono ben accetti feedback, per quanto riguarda segnalazioni di bug, proposte per miglioramenti o domande in generale sul funzionamento del bot stesso.
Puoi contattarmi sia su <a href="https://github.com/theedoran/itabulbot">GitHub</a> aprendo una issue, oppure in privato qui su Telegram, a @TheEdoRan.`;

  return ctx.reply(msg, {
    ...msgExtra,
    ...Markup.inlineKeyboard([
      Markup.button.switchToCurrentChat(
        "🔍  Cerca un comune, una regione o un indirizzo",
        "",
      ),
    ]),
  });
};

export const showAddressSearchHelp = async (ctx) => {
  const msg = `
Ciao <b>${escape(ctx.from.first_name)}</b> 👋!

Questo bot supporta anche la ricerca per indirizzo, come presente sul sito <b>BUL</b>.

Ti basterà premere sul bottone qui sotto per avviare la ricerca di un qualsiasi indirizzo, compreso di <b>numero civico</b>, come ad esempio:

<code>@itabulbot Corso d'Italia, 41, Roma</code>

Una volta fatto ciò, nella finestrella che si apre, basterà premere sulla voce che ti interessa e il bot provvederà a scaricare i dati aggiornati riguardanti l'indirizzo da te scelto.

Troverai anche un comodo bottone per raggiungere la pagina corrispondente sul sito <b>BUL</b>.

<b>Ricorda</b> ❗️

Il funzionamento è il medesimo della ricerca delle città o delle regioni, quindi puoi eseguire la ricerca in <b>qualsiasi chat</b>.

Ti basterà scrivere un indirizzo a tua scelta, proprio come qui in chat privata con me. 

<b>Fai attenzione, però</b>: se deciderai di utilizzare il bot in gruppi pubblici, <b>tutti potranno vedere l'indirizzo cercato</b>.

Il consiglio è quindi di utilizzare la ricerca per indirizzo in <b>questa chat</b>.`;

  return ctx.reply(msg, {
    ...msgExtra,
    ...Markup.inlineKeyboard([
      Markup.button.switchToCurrentChat(
        "🔍  Cerca un comune, una regione o un indirizzo",
        "",
      ),
    ]),
  });
};

export const showFiberData = async (id, ctx) => {
  // Only get msgId if we're processing a chosen inline result
  // (default fiber view).
  const msgId = ctx.chosenInlineResult
    ? ctx.chosenInlineResult.inline_message_id
    : null;

  try {
    const { message, pcn } = await buildFiberData(id);

    let buttons = [
      [Markup.button.callback("📡  Dettagli FWA", `show_fwa_details_${id}`)],
      [
        Markup.button.url(
          "🔗  Visualizza sul sito BUL",
          `https://bandaultralarga.italia.it/mappa/?entity=${id}&indicator=fiber`,
        ),
      ],
    ];

    // Only display PCN details if present for city.
    if (pcn) {
      buttons[0].push(
        Markup.button.callback(
          "🗄  Dettagli PCN",
          `show_pcn_details_fiber_${id}`,
        ),
      );
    }

    // Check if we should cancel the operation (user pressed on cancel button).
    if (cancelRequests.has(msgId)) {
      cancelRequests.delete(msgId);
      return;
    }

    // Update message with data.
    return ctx.editMessageText(message, {
      ...msgExtra,
      ...Markup.inlineKeyboard(buttons),
    });
  } catch (error) {
    return showOpError(ctx);
  }
};

export const showFWAData = async (id, ctx) => {
  try {
    const { message, pcn } = await buildFWAData(id);

    let buttons = [
      [
        Markup.button.callback(
          "🌐  Dettagli fibra",
          `show_fiber_details_${id}`,
        ),
      ],
      [
        Markup.button.url(
          "🔗  Visualizza sul sito BUL",
          `https://bandaultralarga.italia.it/mappa/?entity=${id}&indicator=wireless`,
        ),
      ],
    ];

    // Only display PCN details if present for city.
    if (pcn) {
      buttons[0].push(
        Markup.button.callback("🗄  Dettagli PCN", `show_pcn_details_fwa_${id}`),
      );
    }

    // Update message with data.
    return ctx.editMessageText(message, {
      ...msgExtra,
      ...Markup.inlineKeyboard(buttons),
    });
  } catch (error) {
    return showOpError(ctx);
  }
};

export const showCityPCNData = async (prevStatus, cityId, ctx) => {
  try {
    const [message, sedeId] = await buildCityPCNData(cityId);

    let buttons = [
      [
        Markup.button.url(
          "🔗  Visualizza sul sito BUL",
          `https://bandaultralarga.italia.it/mappa/?entity=${cityId}&pcn=1`,
        ),
      ],
    ];

    const mapUrl = await buildShelterMapUrl(sedeId);

    if (mapUrl) {
      buttons.push([Markup.button.url("🗺  Localizza sulla mappa", mapUrl)]);
    }

    buttons.push([
      Markup.button.callback(
        "◀️  Torna indietro",
        `show_${prevStatus}_details_${cityId}`,
      ),
    ]);

    // Update message with data.
    return ctx.editMessageText(message, {
      ...msgExtra,
      ...Markup.inlineKeyboard(buttons),
    });
  } catch (error) {
    return showOpError(ctx);
  }
};

export const showAddressData = async (cityId, streetId, civic, ctx) => {
  try {
    // We have to query API one more time to get egonId.
    const egonId = await fetchEgonId(streetId, civic);

    // If egon id not found, show an error message.
    if (!egonId) {
      return ctx.editMessageText("❌  <i>Numero civico non trovato.</i>", {
        ...msgExtra,
      });
    }

    const message = await buildAddressData(cityId, egonId);
    const regionId = getRegionIdFromCityId(cityId);

    return ctx.editMessageText(message, {
      ...msgExtra,
      ...Markup.inlineKeyboard([
        Markup.button.url(
          "🔗  Visualizza sul sito BUL",
          buildAddressInfoUrl(regionId, cityId, egonId),
        ),
      ]),
    });
  } catch (error) {
    console.error(error);
    return showOpError(ctx);
  }
};

import { Markup } from "telegraf";
import escape from "html-escape";

import { cities, regions } from "./init.js";
import {
  buildFiberData,
  buildFWAData,
  buildCityPCNData,
  buildShelterMapUrl,
} from "./data.js";
import { getSinfiZipUrl } from "./sinfi.js";

const substring = (s1, s2) => s1.toLowerCase().includes(s2.toLowerCase());

// Extra Telegram options for message edit/send.
const msgExtra = { parse_mode: "HTML", disable_web_page_preview: true };

// Set containing pending cancel requests.
export const cancelRequests = new Set();

// Template for query result.
const buildResult = (id, title, description) => ({
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

const showOpError = (ctx) =>
  ctx
    .editMessageText("😕  <i>Errore nell'eseguire l'operazione.</i>", msgExtra)
    .catch(() => {});

// For /start and /aiuto.
export const showHelp = async ({ from, reply }) => {
  const msg = `
Ciao <b>${escape(from.first_name)}</b> 👋!

Questo bot ti aiuterà a scoprire qual è lo stato dei lavori di fibra ottica/FWA, finanziati dal progetto <i>BandaUltraLarga</i> (<b>#BUL</b>) in una determinata regione o città, da te scelta.

<b>Funzionamento</b>  🔍
Il bot è <b>inline</b>, ovvero funziona in <b>qualsiasi chat</b>, non ha bisogno di comandi in privato per mostrarti le informazioni. Puoi utilizzarlo in conversazioni dirette con altre persone, oppure in gruppi/supergruppi.

Ti basterà digitare l'username del bot stesso, seguito dal termine di ricerca, due esempi pratici:

<code>@itabulbot Roma</code>
<code>@itabulbot Lombardia</code>

Nella finestrella che si apre, basterà premere sulla città o regione corrispondente ed il bot penserà al resto.

<b>Comandi</b>  🖋
/aiuto - Mostra questo messaggio.

<b>FAQ</b> ❓
• <b>Il bot ruba i miei dati personali?</b> <i>No, tranquillo, siamo dalla tua parte.</i>

<b>Contributo</b>  📖
Il bot è <b>free</b> ed <b>open source</b>, rilasciato sotto licenza <a href="https://www.gnu.org/licenses/gpl-3.0.html">GNU GPLv3</a>.
Il codice sorgente e la relativa documentazione si possono trovare a <a href="https://github.com/theedoran/itabulbot">questo indirizzo</a>.

<b>Contatti</b>  👤
Sono ben accetti feedback, per quanto riguarda segnalazioni di bug, proposte per miglioramenti o domande in generale sul funzionamento del bot stesso.
Puoi contattarmi sia su <a href="https://github.com/theedoran/itabulbot">GitHub</a> aprendo una issue, oppure in privato qui su Telegram, a @TheEdoRan.`;

  return reply(msg, msgExtra);
};

export const showFiberData = async (id, ctx) => {
  // Only get msgId if we're processing a chosen inline result
  // (default fiber view).
  const msgId = ctx.chosenInlineResult
    ? ctx.chosenInlineResult.inline_message_id
    : null;

  try {
    const { message, sinfiZipName, pcn } = await buildFiberData(id);

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

    // Only display SINFI details if URL for this city exists.
    if (sinfiZipName) {
      buttons.push([
        Markup.button.callback(
          "🗺  Informazioni SINFI",
          `show_sinfi_details_fiber_${id}_${sinfiZipName}`,
        ),
      ]);
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
    const { message, sinfiZipName, pcn } = await buildFWAData(id);

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

    // Only display SINFI details if URL for this city exists.
    if (sinfiZipName) {
      buttons.push([
        Markup.button.callback(
          "🗺  Informazioni SINFI",
          `show_sinfi_details_fwa_${id}_${sinfiZipName}`,
        ),
      ]);
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
    let [message, sedeId] = await buildCityPCNData(cityId);

    message += `

<b>Cos'è il PCN ❓</b>
I <i>Punti di Consegna Neutri</i> (<b>PCN</b>), sono le <b>centrali</b> a cui fanno capo le fibre ottiche che collegano gli altri elementi della rete per una determinata zona (antenne <b>FWA</b> incluse). Un <b>PCN</b> tipicamente copre più comuni, per un totale di qualche decina di migliaia di unità immobiliari connesse.
Puoi trovare tutte le informazioni al riguardo su <a href="https://fibra.click/riconoscere-rete-bul/#pcn-centrali">fibra.click</a>.`;

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
      buttons.push([Markup.button.url("🗺 Visualizza sulla mappa", mapUrl)]);
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

export const showSinfiDetails = (prevStatus, cityId, zipName, ctx) => {
  try {
    const message = `
<b>Cos'è il SINFI ❓</b>
Il <i>Catasto Nazionale delle Infrastrutture</i> (<b>SINFI</b>), mette a disposizione da ottobre 2019 i tracciati della <b>fibra ottica</b> posizionata nell'ambito del piano nazionale <b>BUL</b>.
Puoi trovare tutte le informazioni al riguardo su <a href="https://fibra.click/bul-sinfi/">fibra.click</a>.

<b>Archivio ZIP  📚</b>
Se hai raggiunto questa pagina, significa che è disponibile un archivio con le tratte di fibra ottica per il paese o la città che hai scelto di cercare.
Ti basterà premere sul pulsante <code>Scarica ZIP</code> per avviare il download.

<b>Visualizzatore  👀</b>
<a href="https://fibra.click/">fibra.click</a> mette a disposizione anche il visualizzatore SINFI.
Ti basterà premere sul relativo pulsante e, una volta aperto il sito, caricare lo ZIP che hai appena scaricato.
Vedrai quindi comparire le varie tratte di fibra ottica.`;

    const buttons = [
      [
        Markup.button.url("📚  Scarica ZIP", getSinfiZipUrl(zipName)),
        Markup.button.url(
          "👀  Visualizzatore",
          "https://fibra.click/bul-sinfi/mappa/",
        ),
      ],
      [
        Markup.button.callback(
          "◀️  Torna indietro",
          `show_${prevStatus}_details_${cityId}`,
        ),
      ],
    ];

    // Update message with SINFI details.
    return ctx.editMessageText(message, {
      ...msgExtra,
      ...Markup.inlineKeyboard(buttons),
    });
  } catch (error) {
    return showOpError(ctx);
  }
};

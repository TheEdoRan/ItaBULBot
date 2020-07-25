import Markup from "telegraf/markup.js";
import escape from "html-escape";

import { cities, regions } from "./init.js";
import { buildFiberData, buildFWAData } from "./data.js";

const substring = (s1, s2) => s1.toLowerCase().includes(s2.toLowerCase());

const replyExtra = { parse_mode: "HTML", disable_web_page_preview: true };

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

// For /start and /aiuto.
export const showHelp = ({ from, reply }) => {
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
Puoi contattarmi sia su <a href="https://github.com/theedoran/itabulbot">GitHub</a> aprendo una issue, oppure in privato qui su Telegram, a @TheEdoRan.
`;

  reply(msg, replyExtra).catch((_) => {});
};

export const showFiberData = async (id, ctx) => {
  try {
    const data = await buildFiberData(id);

    // Update message with data.
    return ctx.editMessageText(data, {
      ...replyExtra,
      reply_markup: Markup.inlineKeyboard([
        Markup.callbackButton(
          "📡  Mostra informazioni su FWA",
          `show_fwa_details_${id}`,
        ),
      ]),
    });
  } catch (error) {
    return ctx.editMessageText(
      "😕  <i>Errore nell'eseguire l'operazione.</i>",
      replyExtra,
    );
  }
};

export const showFWAData = async (id, ctx) => {
  try {
    const data = await buildFWAData(id);

    // Update message with data.
    return ctx.editMessageText(data, {
      ...replyExtra,
      reply_markup: Markup.inlineKeyboard([
        Markup.callbackButton(
          "🌐  Mostra informazioni su fibra ottica",
          `show_fiber_details_${id}`,
        ),
      ]),
    });
  } catch (error) {
    return ctx.editMessageText(
      "😕 <i>Errore nell'eseguire l'operazione.</i>",
      replyExtra,
    );
  }
};

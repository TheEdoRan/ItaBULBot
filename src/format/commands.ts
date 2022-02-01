import escape from "escape-html";

// /start & /aiuto
export const startHelpCommand = (firstName: string) => `Ciao <b>${escape(
	firstName
)}</b> 👋!
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

// /indirizzo
export const addressCommand = (firstName: string) => `Ciao <b>${escape(
	firstName
)}</b> 👋!
Questo bot supporta anche la ricerca per indirizzo, come presente sul sito <b>BUL</b>.

Ti basterà premere sul bottone qui sotto per avviare la ricerca di un qualsiasi indirizzo, compreso di <b>numero civico</b>, come ad esempio:
<code>@itabulbot Corso d'Italia, 41, Roma</code>

Una volta fatto ciò, nella finestrella che si apre, basterà premere sulla voce che ti interessa e il bot provvederà a scaricare i dati aggiornati riguardanti l'indirizzo da te scelto.
Troverai anche un comodo bottone per raggiungere la pagina corrispondente sul sito <b>BUL</b>.

<b>Ricorda</b> ❗️
Il funzionamento è il medesimo della ricerca delle città o delle regioni, quindi puoi eseguire la ricerca in <b>qualsiasi chat</b>.
Ti basterà scrivere un indirizzo a tua scelta, proprio come qui in chat privata con me. 

<b>Fai attenzione, però</b>: se deciderai di utilizzare il bot in gruppi pubblici, <b>tutti potranno vedere l'indirizzo cercato</b>.
Il consiglio è quindi di utilizzare la ricerca per indirizzo in questa chat.`;

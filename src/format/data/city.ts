import { unavailable } from ".";
import type { OperationDates } from "../../api/types";
import type { BulCityAndOf } from "../../data/types";

const _formatCity = (data: BulCityAndOf) =>
  `<b>${data.city_name}</b>

Unità immobiliari totali: ${data.people_data.houses}

${
  !data.of
    ? ""
    : `Piano cantiere: ${data.of.piano_cantiere}

Bando:
  Gara ${data.of.gara} - Lotto ${data.of.lotto} - Fase ${data.of.fase}`
}`.trim();

const _formatCityFiberFwaDates = (dates: OperationDates) => `Previsioni:
  Avvio lavori: ${dates.data_prevista_avvio_lavori || unavailable}
  Chiusura lavori: ${dates.data_prevista_chiusura_lavori || unavailable}
  Operatività: ${dates.data_prevista_operativita || unavailable}`;

export const formatCityFiber = (data: BulCityAndOf) =>
  `${_formatCity(data)}

${
  !data.work_progress.fiber.status
    ? "<b>Non ci sono dati disponibili per la fibra ottica.</b>"
    : `<b>Fibra ottica</b>  🌐

Stato lavori: <b>${data.work_progress.fiber.status}</b>
Tipo di intervento: ${data.intervento.fiber || unavailable}
${
  !data.of || data.of.is_empty_ftth
    ? ""
    : `Unità immobiliari: ${data.of.ui_ftth || unavailable}
PAC/PAL: ${data.of.pac_pal.slice(0, -2) || unavailable}
Importo OdE: ${
        data.of.importo_ode_ftth && data.of.importo_ode_ftth !== "nan"
          ? data.of.importo_ode_ftth.trim() + " €"
          : unavailable
      }
Impresa esecutrice: ${data.of.impresa_esecutrice_ftth || unavailable}
Fornitore DL/CSE: ${data.of.fornitore_dl_cse_ftth || unavailable}
`
}
${_formatCityFiberFwaDates(data.work_progress.fiber.dates)}`
}`;

export const formatCityFwa = (data: BulCityAndOf) =>
  `${_formatCity(data)}

${
  !data.work_progress.wireless.status
    ? "<b>Non ci sono dati disponibili per l'FWA.</b>"
    : `<b>FWA</b>  📡

Stato lavori: <b>${data.work_progress.wireless.status}</b>
Tipo di intervento: ${data.intervento.wireless || unavailable}
${
  !data.of || data.of.is_empty_fwa
    ? ""
    : `Unità immobiliari: ${data.of.ui_fwa || unavailable}
PAC/PAL: ${data.of.pac_pal.slice(0, -2) || unavailable}
Importo OdE: ${
        data.of.importo_ode_fwa && data.of.importo_ode_fwa !== "nan"
          ? data.of.importo_ode_fwa.trim() + " €"
          : unavailable
      }
Impresa esecutrice: ${data.of.impresa_esecutrice_fwa || unavailable}
Fornitore DL/CSE: ${data.of.fornitore_dl_cse_fwa || unavailable}
`
}
${_formatCityFiberFwaDates(data.work_progress.wireless.dates)}`
}`;

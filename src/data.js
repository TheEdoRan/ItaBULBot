import moment from "moment";
import memoize from "memoizee";
import api, { API_URL } from "./api.js";

// Ugly but it works.
const getLevel = (id) => (parseInt(id) > 21 ? "city" : "region");

// Get data from API. Return data and current time (for last update indicator).
const fetchAPIData = async (level, id) => {
  let res = await api.get(
    `${API_URL}/opendata?format=json&level=${level}&id=${id}`,
  );
  res.data.last_update_time = moment().toDate();

  return res;
};

// Memoize fetch function, caching data for 6 hours.
const memoData = memoize(fetchAPIData, { promise: true, maxAge: 21600 * 1000 });

const formatDate = (date) =>
  !!date ? moment(date).format("DD/MM/YYYY") : "non disponibile";

/***************
      CITY
****************/

// Get shared data, both for fiber and FWA.
const getCityBaseData = (data) => `
<b>${data.city_name}</b>

Provincia: ${data.province_name}
Regione: ${data.region_name}

Popolazione: ${data.people_data.people}
Unità immobiliari: ${data.people_data.houses}`;

// Get fiber data for cities only.
const buildCityFiberData = (data) => {
  let msg = getCityBaseData(data);

  // Get current fiber work progress.
  const progress = data.work_progress.fiber;
  const dates = progress.dates;

  msg += `

<b>Fibra ottica</b>

Stato lavori: <b>${progress.status || "non disponibile"}</b>
Tipo di intervento: ${data.intervento.fiber || "non disponibile"}

Previsioni:
  Avvio lavori: ${formatDate(dates.data_prevista_avvio_lavori)}
  Chiusura lavori: ${formatDate(dates.data_prevista_chiusura_lavori)}
  Operatività: ${formatDate(dates.data_prevista_operativita)}`;

  // Only if city has PCN data.
  if (data.pcn) {
    msg += `

Informazioni PCN:
  Sede: ${data.pcn.sede_name}
  Route: ${data.pcn.pcn_route}
  Stato lavori: ${data.pcn.work_status}
  Direttrice: ${data.pcn.direttrice}
  Ordine direttrice: ${data.pcn.ordine_direttrice}
  Cab transitorio: ${data.pcn.cab_transitorio ? "sì" : "no"}`;
  }

  return msg;
};

const buildCityFWAData = (data) => {
  let msg = getCityBaseData(data);

  // Get current fiber work progress.
  const progress = data.work_progress.wireless;
  const dates = progress.dates;

  msg += `

<b>FWA</b>

Stato lavori: <b>${progress.status || "non disponibile"}</b>
Tipo di intervento: ${data.intervento.wireless || "non disponibile"}

Previsioni:
  Avvio lavori: ${formatDate(dates.data_prevista_avvio_lavori)}
  Chiusura lavori: ${formatDate(dates.data_prevista_chiusura_lavori)}
  Operatività: ${formatDate(dates.data_prevista_operativita)}`;

  return msg;
};

/***************
     REGION
****************/

const getRegionBaseData = (data) => {
  const peopleData = data.people_data;
  const workProgress = data.work_progress;
  const percentages = workProgress.mean_status;

  return `
<b>${data.region_name}</b>

Popolazione: ${peopleData.people}
Unità immobiliari: ${peopleData.houses}
Città: ${peopleData.cities}

Percentuale completamento:
  Fibra ottica: <b>${percentages.fiber.toFixed(2)}%</b>
  FWA: <b>${percentages.wireless.toFixed(2)}%</b>`;
};

const getRegionStatuses = (context) =>
  Object.entries(context)
    .map(([k, v]) => `    ${k}: ${v}`)
    .join("\n");

const buildRegionFiberData = (data) => {
  let msg = getRegionBaseData(data);

  const workProgress = data.work_progress;
  const directFiberStatus = workProgress.diretto.fiber.status;
  const grantFiberStatus = workProgress.concessione.fiber.status;

  msg += `

<b>Fibra ottica</b>

Intervento diretto:
  Città pianificate: ${data.intervento.diretto.fiber}

  Stato lavori:
${getRegionStatuses(directFiberStatus)}

Concessione:
  Città pianificate: ${data.intervento.concessione.fiber}

  Stato lavori:
${getRegionStatuses(grantFiberStatus)}`;

  return msg;
};

const buildRegionFWAData = (data) => {
  let msg = getRegionBaseData(data);

  const workProgress = data.work_progress;
  const directFWAStatus = workProgress.diretto.wireless.status;
  const grantFWAStatus = workProgress.concessione.wireless.status;

  msg += `

<b>FWA</b>

Intervento diretto:
  Città pianificate: ${data.intervento.diretto.wireless}

  Stato lavori:
${getRegionStatuses(directFWAStatus)}

Concessione:
  Città pianificate: ${data.intervento.concessione.wireless}

  Stato lavori:
${getRegionStatuses(grantFWAStatus)}`;

  return msg;
};

// Build fiber or FWA data, for city or region.
const buildData = async (type, id) => {
  const level = getLevel(id);
  const { data } = await memoData(level, id);

  let msg = "";

  if (level === "city") {
    if (type === "fiber") {
      msg = buildCityFiberData(data);
    } else {
      msg = buildCityFWAData(data);
    }
  } else {
    if (type === "fiber") {
      msg = buildRegionFiberData(data);
    } else {
      msg = buildRegionFWAData(data);
    }
  }

  const lastTime = `${moment(data.last_update_time).format("HH:mm")}`;
  const lastDate = `${moment(data.last_update_time).format("DD/MM/YYYY")}`;

  msg += `

<i>Ultimo aggiornamento alle ${lastTime} del ${lastDate}</i>`;

  return msg;
};

// Build fiber data based on id.
export const buildFiberData = (id) => buildData("fiber", id);

// Build FWA data based on id.
export const buildFWAData = (id) => buildData("fwa", id);

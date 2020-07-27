import moment from "moment";
import memoize from "memoizee";
import { bulApi, ofApi } from "./api.js";

// Ugly but it works.
const getLevel = (id) => (parseInt(id) > 21 ? "city" : "region");

// Get last update time from API.
const fetchLastUpdate = async () => (await bulApi(`/latest-import`)).data;

// Get data from API.
const fetchAPIData = async (level, id) => {
  let { data } = await bulApi(`/opendata?format=json&level=${level}&id=${id}`);

  // Only gather these infos for city level. Regions don't need them.
  if (level === "city") {
    const cityName = data.city_name;
    const provId = data.province_id;

    // Call OF API to find out OF ID of city, via its name.
    const ofCityId = (await ofApi(`/list/cities/${provId}`)).data.data.filter(
      (city) => city.name === cityName,
    )[0].id;

    const ofCityData = (await ofApi(`/site/${ofCityId}`)).data;

    data.of = ofCityData;
  }

  return data;
};

// Options for memoization.
const memoOpts = { promise: true, maxAge: 21600 * 1000 };

// Memoize fetch functions, caching data for 6 hours.
const memoData = memoize(fetchAPIData, memoOpts);
const memoLastUpdate = memoize(fetchLastUpdate, memoOpts);

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
Unità immobiliari totali: ${data.people_data.houses}

Bando:
  Gara ${data.of.gara} - Lotto ${data.of.lotto} - Fase ${data.of.fase}

Piano cantiere: ${data.of.piano_cantiere}`;

// Get Open Fiber data for city.
const getCityOfFiberData = (of) => {
  if (of.is_empty_ftth) {
    return "";
  }

  return `
Unità immobiliari: ${of.ui_ftth}
PAC/PAL: ${of.pac_pal}
Importo OdE: ${of.importo_ode_ftth.trim()}€
Impresa esecutrice: ${of.impresa_esecutrice_ftth}
Fornitore DL/CSE: ${of.fornitore_dl_cse_ftth}
`;
};

// Build fiber data.
const buildCityFiberData = (data) => {
  let msg = getCityBaseData(data);

  // Get current fiber work progress.
  const progress = data.work_progress.fiber;
  const dates = progress.dates;

  msg += `

<b>Fibra ottica</b>
${getCityOfFiberData(data.of)}
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

// Get Open Fiber data for city.
const getCityOfFWAData = (of) => {
  if (of.is_empty_fwa) {
    return "";
  }

  return `
Unità immobiliari: ${of.ui_fwa}
Importo OdE: ${of.importo_ode_fwa.trim()}€
Impresa esecutrice: ${of.impresa_esecutrice_fwa}
Fornitore DL/CSE: ${of.fornitore_dl_cse_fwa}
`;
};

// Build FWA data.
const buildCityFWAData = (data) => {
  let msg = getCityBaseData(data);

  // Get current fiber work progress.
  const progress = data.work_progress.wireless;
  const dates = progress.dates;

  msg += `

<b>FWA</b>
${getCityOfFWAData(data.of)}
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

// Get shared data, both for fiber and FWA.
const getRegionBaseData = (data) => {
  const peopleData = data.people_data;
  const workProgress = data.work_progress;
  const percentages = workProgress.mean_status;

  return `
<b>${data.region_name}</b>

Popolazione: ${peopleData.people}
Unità immobiliari totali: ${peopleData.houses}
Città: ${peopleData.cities}

Percentuale completamento:
  Fibra ottica: <b>${percentages.fiber.toFixed(2)}%</b>
  FWA: <b>${percentages.wireless.toFixed(2)}%</b>`;
};

// Get various work statuses.
const getRegionWorkStatuses = (context) =>
  Object.entries(context)
    .map(([k, v]) => `    ${k[0].toUpperCase() + k.slice(1)}: ${v}`)
    .join("\n");

// Build fiber data.
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
${getRegionWorkStatuses(directFiberStatus)}

Concessione:
  Città pianificate: ${data.intervento.concessione.fiber}

  Stato lavori:
${getRegionWorkStatuses(grantFiberStatus)}`;

  return msg;
};

// Build FWA data.
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
${getRegionWorkStatuses(directFWAStatus)}

Concessione:
  Città pianificate: ${data.intervento.concessione.wireless}

  Stato lavori:
${getRegionWorkStatuses(grantFWAStatus)}`;

  return msg;
};

// Build fiber or FWA data, for city or region.
const buildData = async (type, id) => {
  const level = getLevel(id);
  const lastUpdate = await memoLastUpdate();
  const apiData = await memoData(level, id);

  // Last work status update date.
  const lastDate = lastUpdate.work_status.date;

  let msg = "";

  if (level === "city") {
    if (type === "fiber") {
      msg = buildCityFiberData(apiData);
    } else {
      msg = buildCityFWAData(apiData);
    }
  } else {
    if (type === "fiber") {
      msg = buildRegionFiberData(apiData);
    } else {
      msg = buildRegionFWAData(apiData);
    }
  }

  // Format last time and day.
  const lastTime = `${moment(lastDate).format("HH:mm")}`;
  const lastDay = `${moment(lastDate).format("DD/MM/YYYY")}`;

  msg += `

<i>Ultimo aggiornamento alle ${lastTime} del ${lastDay}</i>`;

  return msg;
};

// Build fiber data based on id.
export const buildFiberData = (id) => buildData("fiber", id);

// Build FWA data based on id.
export const buildFWAData = (id) => buildData("fwa", id);

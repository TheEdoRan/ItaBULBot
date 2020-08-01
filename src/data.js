import moment from "moment";
import memoize from "memoizee";
import { bulApi, ofApi } from "./api.js";
import { getSinfiZipName } from "./sinfi.js";

/***************
      FETCH
****************/

// Get data from API.
const fetchAPIData = async (level, id) => {
  let { data } = await bulApi(`/opendata?format=json&level=${level}&id=${id}`);

  // Only gather these infos for city level. Regions don't need them.
  if (level === "city") {
    const cityName = data.city_name;
    const provId = data.province_id;

    try {
      // Call OF API to find out OF ID of city, via its name.
      const ofCityId = (await ofApi(`/list/cities/${provId}`)).data.data.filter(
        (city) => city.name === cityName,
      )[0].id;

      const ofCityData = (await ofApi(`/site/${ofCityId}`)).data;

      data.of = ofCityData;
    } catch (_) {
      data.of = null;
    }
  }

  return data;
};

/***************
      UTILS
****************/

// Ugly but it works.
const getLevel = (id) => (parseInt(id) > 21 ? "city" : "region");

// Get last update time from API.
const fetchLastUpdate = async () => (await bulApi(`/latest-import`)).data;

// Options for memoization.
const memoOpts = { promise: true, maxAge: 21600 * 1000 };

// Memoize fetch functions, caching data for 6 hours.
const memoData = memoize(fetchAPIData, memoOpts);
const memoLastUpdate = memoize(fetchLastUpdate, memoOpts);
const memoSinfiZipName = memoize(getSinfiZipName, memoOpts);

const formatDate = (date) =>
  !!date
    ? `<b>${moment(date).format("DD/MM/YYYY")}</b>`
    : "<i>non disponibile</i>";

/***************
      CITY
****************/

// Get shared data, both for fiber and FWA.
const getCityBaseData = (data) => {
  let msg = `
<b>${data.city_name}</b>

Unità immobiliari totali: ${data.people_data.houses}`;

  // Only if city has OpenFiber data.
  if (data.of) {
    msg += `

Bando:
  Gara ${data.of.gara} - Lotto ${data.of.lotto} - Fase ${data.of.fase}

Piano cantiere: ${data.of.piano_cantiere}`;
  }

  return msg;
};

// Get Open Fiber data for city.
const getCityOfFiberData = (of) => {
  if (!of || of.is_empty_ftth) {
    return "";
  }

  return `
Unità immobiliari: ${of.ui_ftth || "non disponibile"}
PAC/PAL: ${of.pac_pal || "non disponibile"}
Importo OdE: ${
    of.importo_ode_ftth ? of.importo_ode_ftth.trim() + "€" : "non disponibile"
  }
Impresa esecutrice: ${of.impresa_esecutrice_ftth || "non disponibile"}
Fornitore DL/CSE: ${of.fornitore_dl_cse_ftth || "non disponibile"}`;
};

// Build fiber data.
const buildCityFiberData = (data) => {
  let msg = getCityBaseData(data);

  // Get current fiber work progress.
  const progress = data.work_progress.fiber;
  const dates = progress.dates;

  // Check for fiber data display. If city has no work progress status,
  // it shouldn't have other infos too.
  if (!progress.status) {
    return `${msg}\n\n<b>Non ci sono dati disponibili per la fibra ottica.</b>`;
  }

  msg += `

<b>Fibra ottica</b>

Stato lavori: <b>${progress.status || "non disponibile"}</b>
Tipo di intervento: ${data.intervento.fiber || "non disponibile"}
${getCityOfFiberData(data.of)}

Previsioni:
  Avvio lavori: ${formatDate(dates.data_prevista_avvio_lavori)}
  Chiusura lavori: ${formatDate(dates.data_prevista_chiusura_lavori)}
  Operatività: ${formatDate(dates.data_prevista_operativita)}`;

  return msg;
};

// Get Open Fiber data for city.
const getCityOfFWAData = (of) => {
  if (!of || of.is_empty_fwa) {
    return "";
  }

  return `
Unità immobiliari: ${of.ui_fwa || "non disponibile"}
Importo OdE: ${
    of.importo_ode_fwa ? of.importo_ode_fwa.trim() + "€" : "non disponibile"
  }
Impresa esecutrice: ${of.impresa_esecutrice_fwa || "non disponibile"}
Fornitore DL/CSE: ${of.fornitore_dl_cse_fwa || "non disponibile"}`;
};

// Build FWA data.
const buildCityFWAData = (data) => {
  let msg = getCityBaseData(data);

  // Get current fiber work progress.
  const progress = data.work_progress.wireless;
  const dates = progress.dates;

  // Check for FWA data display. If city has no work progress status,
  // it shouldn't have other infos too.
  if (!progress.status) {
    return `${msg}\n\n<b>Non ci sono dati disponibili per l'FWA.</b>`;
  }

  msg += `

<b>FWA</b>

Stato lavori: <b>${progress.status || "non disponibile"}</b>
Tipo di intervento: ${data.intervento.wireless || "non disponibile"}
${getCityOfFWAData(data.of)}

Previsioni:
  Avvio lavori: ${formatDate(dates.data_prevista_avvio_lavori)}
  Chiusura lavori: ${formatDate(dates.data_prevista_chiusura_lavori)}
  Operatività: <b>${formatDate(dates.data_prevista_operativita)}</b>`;

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

/***************
     GENERIC
****************/

const getLastUpdateStatus = async () => {
  const lastUpdate = await memoLastUpdate();
  // Format last time and day.

  // Last work status update date.
  const lastDate = lastUpdate.work_status.date;

  // Format date.
  const lastTime = `${moment(lastDate).format("HH:mm")}`;
  const lastDay = `${moment(lastDate).format("DD/MM/YYYY")}`;

  return `\n\n<i>Ultimo aggiornamento alle ${lastTime} del ${lastDay}</i>`;
};

// Build fiber or FWA data, for city or region.
const buildData = async (type, id) => {
  const level = getLevel(id);
  const apiData = await memoData(level, id);

  // Object containing message, possibly SINFI ZIP path and if city has or
  // not PCN infos.
  let data = { message: "", sinfiZipName: null, pcn: false };

  if (level === "city") {
    // Only get SINFI details for city.
    data.sinfiZipName = await memoSinfiZipName(
      apiData.region_name,
      apiData.city_name,
    );

    // Only if city has PCN infos.
    data.pcn = !!apiData.pcn;

    if (type === "fiber") {
      data.message = buildCityFiberData(apiData);
    } else {
      data.message = buildCityFWAData(apiData);
    }
    // If region, no SINFI data is available, just set message prop.
  } else {
    if (type === "fiber") {
      data.message = buildRegionFiberData(apiData);
    } else {
      data.message = buildRegionFWAData(apiData);
    }
  }

  data.message += await getLastUpdateStatus();

  return data;
};

/***************
     EXPORTS
****************/

// Build fiber data based on id.
export const buildFiberData = (id) => buildData("fiber", id);

// Build FWA data based on id.
export const buildFWAData = (id) => buildData("fwa", id);

// Build PCN data based on city id.
export const buildCityPCNData = async (cityId) => {
  const data = await memoData("city", cityId);

  let msg = `

Informazioni <b>PCN</b> per <b>${data.city_name}</b>:
  Sede: <b>${data.pcn.sede_name}</b>
  Route: ${data.pcn.pcn_route}
  Stato lavori: <b>${data.pcn.work_status}</b>
  Direttrice: ${data.pcn.direttrice}
  Ordine direttrice: ${data.pcn.ordine_direttrice}
  Cab transitorio: ${data.pcn.cab_transitorio ? "sì" : "no"}`;

  msg += await getLastUpdateStatus();

  return msg;
};

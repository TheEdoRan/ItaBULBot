import type { BulRegionApi, RegionWorkStatus } from "../../api/types";
import { capitalize } from "../../utils";

const _formatRegion = (data: BulRegionApi) => `<b>${data.region_name}</b>

Unità immobiliari totali: ${data.people_data.houses}
Città: ${data.people_data.cities}

Percentuale completamento:
  Fibra ottica: <b>${Math.round(data.work_progress.mean_status.fiber)}%</b>
  FWA: <b>${Math.round(data.work_progress.mean_status.wireless)}%</b>`;

const _formatRegionWorkStatus = (status: RegionWorkStatus) =>
  Object.entries(status)
    .map(([k, v]) => `    ${capitalize(k)}: ${v}`)
    .join("\n");

export const formatRegionFiber = (data: BulRegionApi) => `${_formatRegion(data)}

<b>Fibra ottica</b>  🌐

Intervento diretto:
  Città pianificate: ${data.intervento.diretto.fiber}

  Stato lavori:
${_formatRegionWorkStatus(data.work_progress.diretto.fiber.status)}
  
Concessione:
  Città pianificate: ${data.intervento.concessione.fiber}

  Stato lavori:
${_formatRegionWorkStatus(data.work_progress.concessione.fiber.status)}`;

export const formatRegionFwa = (data: BulRegionApi) => `${_formatRegion(data)}

<b>FWA</b>  📡

Intervento diretto:
  Città pianificate: ${data.intervento.diretto.wireless}

  Stato lavori:
${_formatRegionWorkStatus(data.work_progress.diretto.wireless.status)}
  
Concessione:
  Città pianificate: ${data.intervento.concessione.wireless}

  Stato lavori:
${_formatRegionWorkStatus(data.work_progress.concessione.wireless.status)}`;

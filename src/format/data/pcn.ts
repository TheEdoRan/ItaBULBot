import type { CityPcnInfo } from "../../api/types";

export const formatPcnData = (data: CityPcnInfo, cityName: string) => {
  return `Informazioni <a href=\"https://fibra.click/riconoscere-rete-bul/#pcn-centrali\">PCN</a> per <b>${cityName}</b>:
  Sede: <b>${data.sede_name}</b>
  Route: ${data.pcn_route}
  Stato lavori: <b>${data.work_status}</b>
  Direttrice: ${data.direttrice}
  Ordine direttrice: ${data.ordine_direttrice}
${
  !data.cab_transitorio
    ? ""
    : `
⚠️ Il comune risulta al momento servito da temporaneo <a href="https://fibra.click/riconoscere-rete-bul/#mini-pcn">mini PCN</a>.`
}`.trim();
};

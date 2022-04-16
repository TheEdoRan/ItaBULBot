import type { BulEgonDataApi } from "../../api/types";

const _getWorkType = (workType: string) => {
	switch (workType) {
		case "A":
			return "Area Grigia/Nera - Operatore privato";
		case "B":
			return "Area Grigia/Nera - Prossimo intervento pubblico";
		case "C":
			return "Area Bianca - Intervento pubblico in corso";
		default:
			return "";
	}
};

export const formatAddress = (data: BulEgonDataApi, province: string) => {
	return `<b>${data.indirizzo_compl}</b> - <i>${data.comune} (${province})</i>

Tipologia civico:
  <b>${_getWorkType(data.tipo_intervento)}</b>
${
	data.anno_intervento_a
		? `
Copertura prevista per l'anno: <b>${data.anno_intervento_a}</b>
`
		: ""
}
Numero operatori privati attivi al 2021:
  <code>${
		data.operatori_fibra || "0"
	}</code>  1 Gbit/s Fibra Ottica - <b>FTTH/FTTB</b>
  <code>${
		data.operatori_rame_100_200 || "0"
	}</code>  100 Mbit/s - 200 Mbit/s - <b>FTTC</b>
  <code>${
		data.operatori_rame_30_100 || "0"
	}</code>  30 Mbit/s - 100 Mbit/s - <b>FTTC</b>`;
};

export const formatAddressNotFound = () => {
	return "❌  <i>Nessun dato trovato per questo numero civico.</i>";
};

import type { BulEgonDataApi } from "../../api/types";

export const formatAddressNotFound = () =>
  "❌  <i>Numero civico non trovato.</i>";

const _getAddressCoveragePosition = (key: string) => {
  if (key.endsWith("_num_fo")) {
    return 0;
  }

  if (key.endsWith("_rame")) {
    return 1;
  }

  if (key.endsWith("_num_fwa_vhcn")) {
    return 2;
  }

  if (key.endsWith("_num_fwa_no_vhcn")) {
    return 3;
  }
};

const _getAddressCoverageName = (position: number) => {
  switch (position) {
    case 0:
      return "FTTH/FTTB";
    case 1:
      return "FTTC";
    case 2:
      return "FWA VHCN";
    case 3:
      return "FWA no VHCN";
  }
};

const _formatAddressCoverage = (data: BulEgonDataApi) => {
  let years: { [key: string]: number[] } = {};

  Object.keys(data).map((k) => {
    const coverageMatch = k.match(/^a(\d{2})(.+)$/)?.slice(1);

    if (coverageMatch) {
      let [year, rest] = coverageMatch;
      year = `20${year}`;
      const position = _getAddressCoveragePosition(rest)!;

      years[year] = years[year] || [];

      // @ts-ignore
      years[year][position] = data[k];
    }
  });

  const msg = Object.entries(years)
    .map(([year, coverages]) => {
      let yearText = `  <b>${year}</b>\n`;
      yearText += coverages
        .map(
          (value, pos) =>
            `    ${_getAddressCoverageName(pos)}: <b>${value}</b>\n`
        )
        .join("");

      return yearText;
    })
    .join("\n");

  return msg;
};

export const formatAddress = (data: BulEgonDataApi) => `<b>${
  data.indirizzo_compl
}</b>, <i>${data.comune}</i>

Tipologia civico: <b>${data.tipologia_civico_22}</b>

Coperture private:
${_formatAddressCoverage(data).replace(/\n.*$/, "")}`;

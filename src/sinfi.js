import axios from "axios";
import { sinfiRegions } from "./init.js";

const BASE_URL = "https://sinfi.it/portal";

let ZIP_DATE = "";

export const sinfiReq = (url) => axios.get(`${BASE_URL}${url}`);

export const getSinfiZipName = async (region, city) => {
  try {
    // Sanitize city arg.
    city = city.replace(/[àèéìòùÀÈÉÌÒÙ]/g, "");

    const { data: cities } = await sinfiReq(sinfiRegions[region]);

    const cityTags = cities.match(
      /^<li><a.* href="\/portal\/download_files.*<\/li>/gm,
    );

    for (let tag of cityTags) {
      let [url, name] = tag
        .match(/<li>.*href="(.*?)(?=").*noreferrer">(.*)<\/a><\/li>/)
        .slice(1);

      // Correct encoding and sanitize SINFI city name.
      name = Buffer.from(name, "latin1")
        .toString()
        .replace(/[àèéìòùÀÈÉÌÒÙ]/g, "");

      // If city arg is equal to city name of this tag, return the actual
      // zip name.
      if (city === name) {
        // Set ZIP date for every request.
        ZIP_DATE = url.slice(
          url.indexOf("progettiinfratel_") + 17,
          url.lastIndexOf("/"),
        );
        return url.slice(url.lastIndexOf("/") + 1, -4);
      }
    }

    // If no zip found, return null.
    return null;
    // If any error(s), return null.
  } catch {
    return null;
  }
};

// For ZIP download.
export const getSinfiZipUrl = (zipName) =>
  `${BASE_URL}/download_files/progettiinfratel_${ZIP_DATE}/${zipName}.zip`;

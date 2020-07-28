import axios from "axios";
import { sinfiRegions } from "./init.js";

export const sinfiReq = (url) => axios.get(`https://sinfi.it/portal${url}`);

export const getSinfiZipUrl = async (region, city) => {
  // Sanitize city arg.
  city = city.replace(/[àèéìòùÀÈÉÌÒÙ]/g, "");

  const { data: cities } = await sinfiReq(sinfiRegions[region]);

  const cityTags = cities.match(
    /^<li><a.* href="\/portal\/download_files.*<\/li>/gm,
  );

  for (let tag of cityTags) {
    try {
      let [url, name] = tag
        .match(/<li>.*href="(.*?)(?=").*noreferrer">(.*)<\/a><\/li>/)
        .slice(1);

      // Correct encoding and sanitize SINFI city name.
      name = Buffer.from(name, "latin1")
        .toString()
        .replace(/[àèéìòùÀÈÉÌÒÙ]/g, "");

      // If city arg is equal to city name of this tag, return the actual
      // zip URL.
      if (city === name) {
        return url;
      }
    } catch {}
  }

  // If no zip found, return null.
  return null;
};

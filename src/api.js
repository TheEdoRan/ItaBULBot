import crypto from "crypto";
import https from "https";
import axios from "axios";

// OPEN FIBER UTILS

const ofSecret = "6Yk9SPasgejjkapLJ5EkZwBhxFY8eLGLbBaqkfY8ymtFsaJr";

const ofTimestamp = () => {
  const date = new Date();
  return (
    date.setMinutes(10 * Math.floor(date.getMinutes() / 10)),
    date.setSeconds(0, 0),
    Math.round(date.getTime() / 1e3)
  );
};

const ofDigest = (endpoint, timestamp) => {
  return crypto
    .createHmac("sha256", ofSecret)
    .update(`GET:${endpoint}:${timestamp}`)
    .digest("hex");
};

// API CALLS

// Get from BUL API.
export const bulApi = (endpoint) =>
  axios.get(endpoint, {
    baseURL: "https://bandaultralarga.italia.it/wp-json/bul/v1",
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  });

// Get from OF API.
export const ofApi = (endpoint) => {
  endpoint = `/api2/infratel${endpoint}`;

  return axios.get(endpoint, {
    baseURL: `https://openfiber.it`,
    headers: {
      accept: "*/*",
      "accept-language": "it",
      authorization: "Basic anVzdGJpdDpkZXZwYXNz",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-of-date": ofTimestamp(),
      "x-of-hash": ofDigest(endpoint, ofTimestamp()),
      cookie: "cookie_enabled_1=dismiss",
    },
  });
};

export const avtApi = (endpoint) =>
  axios.get(endpoint, {
    baseURL: "https://www.fastweb.it/AVTSL/ajax",
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
      connection: "keep-alive",
      DNT: 1,
      host: "www.fastweb.it",
      referer: "https://www.fastweb.it/AVT/Start/?layout=standalone&modal",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "sec-gpc": "1",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.105 Safari/537.36",
      "x-requested-with": "XMLHttpRequest",
    },
  });

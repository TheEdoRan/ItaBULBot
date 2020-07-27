import crypto from "crypto";
import https from "https";
import axios from "axios";

// OPEN FIBER UTILS

const ofSecret = "6Yk9SPasgejjkapLJ5EkZwBhxFY8eLGLbBaqkfY8ymtFsaJr";

const ofTimestamp = () => {
  var date = new Date();
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

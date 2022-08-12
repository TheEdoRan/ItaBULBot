import crypto from "crypto";
import https from "https";

import axios from "axios";

// Open Fiber utils
const ofTimestamp = () => {
	const date = new Date();
	return (date.setMinutes(10 * Math.floor(date.getMinutes() / 10)),
	date.setSeconds(0, 0),
	Math.round(date.getTime() / 1e3)).toString();
};

const ofDigest = (endpoint: string, timestamp: string) => {
	return crypto
		.createHmac("sha256", process.env.OF_SECRET!)
		.update(`GET:${endpoint}:${timestamp}`)
		.digest("hex");
};

// BUL API
export const bulApi = (endpoint: string) => {
	return axios.get(endpoint, {
		baseURL: "https://bandaultralarga.italia.it/wp-json/bul/v1",
		httpsAgent: new https.Agent({ rejectUnauthorized: false }),
	});
};

// OF API
export const ofApi = (end: string) => {
	const endpoint = `/api2/infratel${end}`;

	return axios.get(endpoint, {
		baseURL: `https://openfiber.it`,
		headers: {
			"accept": "*/*",
			"accept-language": "it",
			"authorization": "Basic anVzdGJpdDpkZXZwYXNz",
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-origin",
			"x-of-date": ofTimestamp(),
			"x-of-hash": ofDigest(endpoint, ofTimestamp()),
			"cookie": "cookie_enabled_1=dismiss",
		},
	});
};

// Address search (AVT) API
export const avtApi = (endpoint: string) => {
	return axios.get(endpoint, {
		baseURL: "https://www.fastweb.it/AVTSL/ajax",
		headers: {
			"accept": "application/json, text/javascript, */*; q=0.01",
			"accept-encoding": "gzip, deflate, br",
			"accept-language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
			"connection": "keep-alive",
			"DNT": "1",
			"host": "www.fastweb.it",
			"referer":
				"https://www.fastweb.it/AVT/Start/?layout=standalone&modal",
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-origin",
			"sec-gpc": "1",
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.105 Safari/537.36",
			"x-requested-with": "XMLHttpRequest",
		},
	});
};

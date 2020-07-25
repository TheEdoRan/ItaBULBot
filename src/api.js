import https from "https";
import axios from "axios";

// Create axios instance and ignore SSL errors.
export default axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
});

// Base URL.
export const API_URL = "https://bandaultralarga.italia.it/wp-json/bul/v1";

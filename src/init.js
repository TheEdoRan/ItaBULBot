import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// Get current file path.
const __dirname = dirname(fileURLToPath(import.meta.url));

// Directory for fetched JSONs.
const JSON_PATH = path.join(__dirname, "..", "json");

const parseJson = (filename) =>
  JSON.parse(fs.readFileSync(`${JSON_PATH}/${filename}.json`));

// Get regions from JSON.
export const regions = parseJson("regions");
export const cities = parseJson("cities");

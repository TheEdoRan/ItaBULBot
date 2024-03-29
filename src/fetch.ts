import fs from "fs";
import path from "path";

import { bulApi } from "./api";

// Directory for fetched JSONs.
const JSON_PATH = path.join(__dirname, "data", "json");

// Create dir if its doesn't exist.
if (!fs.existsSync(JSON_PATH)) {
	fs.mkdirSync(JSON_PATH);
}

const fetch = async () => {
	try {
		// Fetch region IDs.
		let { data: regions } = await bulApi("/regions");

		regions = regions.map(
			(r: { region_id: number; region_name: string }) => {
				return {
					id: r.region_id,
					name: r.region_name,
				};
			}
		);

		// Write regions to JSON.
		fs.writeFileSync(
			`${JSON_PATH}/regions.json`,
			JSON.stringify(regions, null, 2),
			{ flag: "w" }
		);

		console.log("Successfully wrote regions to file!");

		// Initialize cities array.
		const allCities: { id: number; name: string; region_name: string }[] =
			[];

		await Promise.all(
			regions.map(async (r: { id: number; name: string }) => {
				// Get cities for the region.
				const { data: citiesData } = await bulApi(
					`/region/${r.id}/cities`
				);

				allCities.push(
					...citiesData.map(
						(c: { city_id: number; city_name: string }) => {
							return {
								id: c.city_id,
								name: c.city_name,
								region_name: r.name,
							};
						}
					)
				);
			})
		);

		// Write regions to JSON.
		fs.writeFileSync(
			`${JSON_PATH}/cities.json`,
			JSON.stringify(allCities, null, 2),
			{ flag: "w" }
		);

		console.log("Successfully wrote cities to file!");
	} catch (e: any) {
		console.error(e?.message);
	}
};

fetch().catch(() => undefined);

import { AxiosResponse } from "axios";
import { Memoize } from "typescript-memoize";

import { avtApi, bulApi, ofApi } from "../api";

import type {
	AvtNumber,
	AvtNumberApi,
	AvtSearchApi,
	AvtSearchInfo,
	BulCityApi,
	BulEgonDataApi,
	BulLatestImport,
	BulPcnApi,
	BulRegionApi,
	OfCityApi,
	OfProvinceApi,
} from "../api/types";
import type { BulCityAndOf, City, CityRegionLevel } from "./types";

const memoOpts: Parameters<typeof Memoize>[0] = {
	// Memo expiration: 6 hours.
	expiring: 21600 * 1000,
	tags: ["data"],
};

export class Fetch {
	// Get latest update from BUL API.
	@Memoize(memoOpts)
	static async latestUpdate(): Promise<BulLatestImport> {
		return (await bulApi("/latest-import")).data;
	}

	// Get data from BUL and OF APIs.
	@Memoize({
		...(memoOpts as object),
		hashFunction: (level: CityRegionLevel, id: number) => `${level}~${id}`,
	})
	static async data(
		level: CityRegionLevel,
		id: string
	): Promise<BulCityAndOf | BulRegionApi> {
		const { data }: AxiosResponse<BulCityApi | BulRegionApi> = await bulApi(
			`/opendata?format=json&level=${level}&id=${id}`
		);

		// Region level.
		if (level === "region") {
			return data as BulRegionApi;
		}

		// City level.
		const cityData = data as BulCityAndOf;
		const { city_name: cityName, province_id: provId } = cityData;

		try {
			// Call OF API to find out OF city id, via its name.
			const ofCityId: OfProvinceApi = (
				await ofApi(`/list/cities/${provId}`)
			).data.data.find((city: City) => city.name === cityName).id;

			const ofCityData: OfCityApi = (await ofApi(`/site/${ofCityId}`)).data;

			// OF fetch successful, put OF data in return object.
			return {
				...cityData,
				of: ofCityData,
			};

			// OF fetch failed, just return BUL data.
		} catch {
			return cityData;
		}
	}

	// Get PCN data from API.
	@Memoize(memoOpts)
	static async pcnData(cityId: string): Promise<BulPcnApi> {
		const { data }: AxiosResponse<BulPcnApi> = await bulApi(
			`/shelters?cities=${cityId}`
		);

		return data;
	}

	// Get addresses from API.
	static async searchAddresses(query: string): Promise<AvtSearchInfo[]> {
		// Encode query.
		const addressQuery = encodeURIComponent(query);

		const { data }: AxiosResponse<AvtSearchApi> = await avtApi(
			`/getVia/?q=${addressQuery}`
		);
		return data.resp;
	}

	// Get house number info from API.
	static async numberInfo(
		streetId: string,
		number: string
	): Promise<AvtNumber> {
		// Encode civic number.
		const uppercaseNumber = number.toUpperCase();
		const encodedNumber = encodeURIComponent(uppercaseNumber);

		const { data }: AxiosResponse<AvtNumberApi> = await avtApi(
			`/getCivic/?q=${encodedNumber}&idvia=${streetId}`
		);

		// Check which "toponomastico" element is equal to this house number.
		// If not found, try to find house number without exponent (e.g. 13/L -> 13).
		const numberData =
			data.resp.find((c) => c.toponomastico === uppercaseNumber) ||
			data.resp.find((c) => number.includes(c.toponomastico));

		// If no data found for this house number, throw a new error.
		if (!numberData) {
			throw new Error(
				"numberInfo: Could not fetch data for this house number."
			);
		}

		// Otherwise return data.
		return numberData;
	}

	// Get EGON data from API.
	static async egonData(egonId: string): Promise<BulEgonDataApi> {
		const { data }: AxiosResponse<BulEgonDataApi> = await bulApi(
			`/address-info/${egonId}`
		);

		return data;
	}
}

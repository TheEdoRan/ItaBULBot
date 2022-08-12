import type { BulCityApi, OfCityApi } from "../../api/types";

export interface Region {
	id: number;
	name: string;
}

export interface City {
	id: number;
	name: string;
	region_name: string;
}

export type CityRegionLevel = "city" | "region";
export type FiberFwa = "fiber" | "fwa";

export interface BulCityAndOf extends BulCityApi {
	of?: OfCityApi;
}

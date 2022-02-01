interface Region {
	id: number;
	name: string;
	cod_istat: string;
}

interface Province {
	id: number;
	name: string;
	cod_istat: string;
	acronym: string;
	region: Region;
}

interface CoveredOlo {
	id: number;
	tier: number;
	position: number;
}

interface CoveredCity {
	id: number;
	coverage: number;
	is_public: boolean;
	covered_olos: CoveredOlo[];
}

interface City {
	id: number;
	name: string;
	egon_id: string;
	unique_code: number;
	padding_unique_code: string;
	cluster: string;
	province: Province;
	covered_city: CoveredCity;
	created_at: string;
	updated_at: string;
}

export interface OfCityApi {
	id: number;
	is_empty_ftth: boolean;
	is_empty_fwa: boolean;
	gara: string;
	lotto: string;
	fase: string;
	piano_cantiere: string;
	stato_cantiere_ftth: string;
	ui_ftth: string;
	pac_pal: string;
	importo_ode_ftth: string;
	impresa_esecutrice_ftth: string;
	fornitore_dl_cse_ftth: string;
	stato_cantiere_fwa: string;
	ui_fwa: string;
	importo_ode_fwa: string;
	impresa_esecutrice_fwa: string;
	fornitore_dl_cse_fwa: string;
	latitude: number;
	longitude: number;
	City: City;
}

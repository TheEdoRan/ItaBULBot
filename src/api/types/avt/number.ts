export interface AvtNumber {
	IdCivico: string;
	NumeroCivico: string;
	EsponenteCivico: string;
	CivicoCatastale: string;
	ColoreCivico: string;
	ListaRisorse: any;
	toponomastico: string;
}

export interface AvtNumberApi {
	status: string;
	resp: AvtNumber[];
	time: number;
}

interface PeopleData {
	people: number;
	houses: number;
}

interface FiberWirelessWorkProgress {
	status: string;
	all_status: string[];
	dates: OperationDates;
}

interface WorkProgress {
	fiber: FiberWirelessWorkProgress;
	wireless: FiberWirelessWorkProgress;
}

interface Intervention {
	fiber: string;
	wireless: string;
}

interface FiberWirelessOperation {
	concessione: boolean;
	diretto: boolean;
}

interface AllIntervention {
	wireless: FiberWirelessOperation;
	fiber: FiberWirelessOperation;
}
export interface CityPcnInfo {
	pcn_route: string;
	sede_name: string;
	sede_id: string;
	work_status: string;
	ordine_direttrice: string;
	direttrice: string;
	cab_transitorio: boolean;
}

export interface OperationDates {
	data_prevista_avvio_lavori?: string;
	data_prevista_chiusura_lavori?: string;
	data_prevista_operativita?: string;
}
export interface BulCityApi {
	region_name: string;
	region_id: number;
	people_data: PeopleData;
	type: string;
	city_id: number;
	city_id_2017: number;
	city_name: string;
	province_id: number;
	province_name: string;
	pcn?: CityPcnInfo;
	work_progress: WorkProgress;
	intervento: Intervention;
	all_intervento: AllIntervention;
	districts?: any;
}

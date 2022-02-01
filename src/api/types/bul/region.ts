interface PeopleData {
	people: number;
	houses: number;
	cities: number;
}

interface Worksites {
	diretto: number;
	concessione: number;
}

interface WorkStatusYears {
	2018: RegionWorkStatus;
	2019: RegionWorkStatus;
	2020: RegionWorkStatus;
	2021: RegionWorkStatus;
	2022: RegionWorkStatus;
	status: RegionWorkStatus;
}

type FiberWirelessType = WorkStatusYears | number;

interface FiberWirelessContext<T extends FiberWirelessType> {
	fiber: T;
	wireless: T;
}

interface WorkTypeContext<T extends FiberWirelessType> {
	diretto: FiberWirelessContext<T>;
	concessione: FiberWirelessContext<T>;
}

interface WorkProgress extends WorkTypeContext<WorkStatusYears> {
	mean_status: FiberWirelessContext<number>;
}

interface Intervention extends WorkTypeContext<number> {}

export interface RegionWorkStatus {
	in_programmazione: number;
	in_progettazione_definitiva: number;
	in_progettazione_esecutiva: number;
	in_esecuzione: number;
	lavori_chiusi: number;
	in_collaudo: number;
	terminato: number;
}
export interface BulRegionApi {
	region_name: string;
	region_id: number;
	people_data: PeopleData;
	type: string;
	work_progress: WorkProgress;
	no_infratel_cities: number;
	intervento: Intervention;
	cantieri: Worksites;
}

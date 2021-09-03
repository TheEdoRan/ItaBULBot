interface City {
  id: number;
  name: string;
  latitude: string;
  longitude: string;
}

export interface OfProvinceApi {
  province: string;
  count: number;
  data: City[];
}

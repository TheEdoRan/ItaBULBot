export interface AvtSearchInfo {
  iso3: string;
  level: string;
  id: number;
  score: number;
  country: string;
  region: string;
  province: string;
  city: string;
  zipcode: string;
  street: string;
  number: string;
  exponent?: string;
}

export interface AvtSearchApi {
  status: string;
  resp: AvtSearchInfo[];
  time: number;
}

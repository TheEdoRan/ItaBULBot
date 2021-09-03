import { AxiosResponse } from "axios";
import { MemoizeExpiring } from "typescript-memoize";
import { avtApi, bulApi, ofApi } from "../api";
import type {
  AvtSearchApi,
  AvtSearchInfo,
  BulCityApi,
  BulLatestImport,
  BulRegionApi,
  BulPcnApi,
  OfProvinceApi,
  OfCityApi,
  AvtNumberApi,
  AvtNumber,
  BulEgonDataApi,
} from "../api/types";
import type { City, CityAndOf, CityRegionLevel } from "./types";

// Memo expiration: 6 hours.
const memoExpiration = 21600 * 1000;

export class Fetch {
  // Get latest update from BUL API.
  @MemoizeExpiring(memoExpiration)
  static async latestUpdate(): Promise<BulLatestImport> {
    return (await bulApi("/latest-import")).data;
  }

  // Get data from BUL and OF APIs.
  @MemoizeExpiring(
    memoExpiration,
    (level: CityRegionLevel, id: number) => `${level}~${id}`
  )
  static async data(
    level: CityRegionLevel,
    id: string
  ): Promise<CityAndOf | BulRegionApi> {
    const { data }: AxiosResponse<BulCityApi | BulRegionApi> = await bulApi(
      `/opendata?format=json&level=${level}&id=${id}`
    );

    // Region level.
    if (level === "region") {
      return data as BulRegionApi;
    }

    // City level.
    const cityData = data as CityAndOf;
    const { city_name: cityName, province_id: provId } = cityData;

    try {
      // Call OF API to find out OF city id, via its name.
      const ofCityId: OfProvinceApi = (
        await ofApi(`/list/cities/${provId}`)
      ).data.data.find((city: City) => city.name === cityName).id;

      const ofCityData: OfCityApi = (await ofApi(`/site/${ofCityId}`)).data;
      // OF fetch failed, don't put OF data in return object.
      return {
        ...cityData,
        of: ofCityData,
      };
    } catch (_) {
      return cityData;
    }
  }

  // Get PCN data from API.
  @MemoizeExpiring(memoExpiration)
  static async pcnData(cityId: string): Promise<BulPcnApi> {
    let { data }: AxiosResponse<BulPcnApi> = await bulApi(
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
    number = number.toUpperCase();
    const encodedNumber = encodeURIComponent(number);

    const { data }: AxiosResponse<AvtNumberApi> = await avtApi(
      `/getCivic/?q=${encodedNumber}&idvia=${streetId}`
    );

    const numberData = data.resp.find((c) => c.toponomastico === number);

    // If no data found for this house number, throw a new error.
    if (!numberData) {
      throw new Error();
    }

    // Otherwise return data.
    return numberData;
  }

  // Get EGON data from API.
  static async egonData(
    cityId: string,
    egonId: string
  ): Promise<BulEgonDataApi> {
    const { data }: AxiosResponse<BulEgonDataApi> = await bulApi(
      `/address-info/${cityId}/${egonId}`
    );

    return data;
  }
}

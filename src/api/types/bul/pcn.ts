interface Geometry {
  type: string;
  coordinates: [number, number];
}

interface FeatureProperties {
  procom: string;
  etichetta: string;
  nome_progetto: string;
  id_fase: number;
  profondita: number;
  id_categoria: string;
  id_posa: number;
  tipo: string;
  id_regione: number;
  id_provincia: number;
}

interface Feature {
  type: string;
  geometry: Geometry;
  properties: FeatureProperties;
}

interface Properties {
  procoms: string;
}

export interface BulPcnApi {
  type: string;
  features?: Feature[];
  properties: Properties;
}

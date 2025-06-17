export interface VatsimEventData {
  data: Datum[];
}

export interface Datum {
  id: number;
  type: string;
  name: string;
  link: string;
  organisers: Organiser[];
  airports: Airport[];
  routes: Route[];
  start_time: Date;
  end_time: Date;
  short_description: string;
  description: string;
  banner: string;
}

export interface Airport {
  icao: string;
}

export interface Organiser {
  region: string;
  division: string;
  subdivision: null;
  organised_by_vatsim: boolean;
}

export interface Route {
  departure: string;
  arrival: string;
  route: string;
}

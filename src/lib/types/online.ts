export interface OnlinePilot {
  cid: number;
  name: string;
  callsign: string;
  departure: string;
  arrival: string;
  aircraft: string;
}

export interface OnlineController {
  cid: number;
  name: string;
  callsign: string;
  frequency: string;
}

export interface FutureController {
  callsign: string;
  name: string;
  start: string;
  end: string;
}

export interface OnlineData {
  lastUpdated: string;
  pilots: Array<OnlinePilot>;
  controllers: Array<OnlineController>;
  futureControllers: Array<FutureController>;
}

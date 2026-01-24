export interface Vplaaf {
  areas: Area[];
}

export interface Area {
  area_type: AreaType;
  name: string;
  limits: Limits;
  category: Category;
  usertext: null | string;
  label: Label | null;
  vertices: string[];
  circle?: Circle;
}

export enum AreaType {
  T = "T",
}

export enum Category {
  Danger = "Danger",
  Prohibit = "Prohibit",
  Restricted = "Restricted",
}

export interface Circle {
  center: string;
  radius: string;
}

export interface Label {
  point: string;
  text: string;
}

export interface Limits {
  lower: Lower;
  upper: string;
}

export enum Lower {
  Gnd = "GND",
  The1000M = "1000M",
  The2200M = "2200M",
  The6000M = "6000M",
}

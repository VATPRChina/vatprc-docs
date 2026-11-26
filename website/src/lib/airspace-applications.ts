import { client } from "./client/client";

export type Coordinate = { latitude: number; longitude: number };
export type Boundary =
  { type: "circle"; center: Coordinate; radius_km: number } | { type: "polygon"; vertices: Coordinate[] };
export type ApplicationRequest = {
  starts_at: string;
  ends_at: string;
  category: string;
  lower_ft: number;
  upper_ft: number;
  label: string;
  remarks: string | null;
  boundary: Boundary;
};
export type Application = ApplicationRequest & {
  id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_cid: string;
  created_at: string;
  status: "submitted" | "approved" | "rejected";
  reviewed_at: string | null;
  review_comment: string | null;
};
type Result<T> = { data?: T; error?: { detail?: string; title?: string } };
type AirspaceClient = {
  GET(path: "/api/airspace-applications"): Promise<Result<Application[]>>;
  POST(path: "/api/airspace-applications", options: { body: ApplicationRequest }): Promise<Result<Application>>;
  PUT(
    path: "/api/airspace-applications/{id}/review",
    options: {
      params: { path: { id: string } };
      body: { status: "approved" | "rejected"; comment: string | null };
    },
  ): Promise<Result<Application>>;
};

// Uses the shared client so access-token refresh and error handling remain in effect.
export const airspaceClient = client as unknown as AirspaceClient;

export function parseCoordinate(value: string): Coordinate | null {
  const match = /^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*$/.exec(value);
  if (!match) return null;
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  return Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
    ? { latitude, longitude }
    : null;
}

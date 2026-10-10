import { RouteViewer } from "./route-viewer";
import { renderComponent } from "@/test/render-component";
import { beforeEach, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ permissions: vi.fn(), query: vi.fn(), refetch: vi.fn() }));
vi.mock("@/lib/client", () => ({ usePermissions: mocks.permissions, $api: { useQuery: mocks.query } }));
// Start's server helpers require virtual entries unavailable in component tests.
vi.mock("@/lib/utils", async () => ({ cn: (await import("clsx")).clsx }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.permissions.mockReturnValue(["software-engineer"]);
  mocks.query.mockReturnValue({ isLoading: true, isFetching: false, refetch: mocks.refetch });
});

test("hides the viewer and does not query without the SWE role", async () => {
  mocks.permissions.mockReturnValue(["user"]);
  const screen = await renderComponent(<RouteViewer />);
  await expect.element(screen.getByRole("textbox", { name: "Complete route" })).not.toBeInTheDocument();
  expect(mocks.query).not.toHaveBeenCalled();
});

test("parses submitted complete routes, leaving edits unsubmitted until the next parse", async () => {
  const screen = await renderComponent(<RouteViewer />);
  const input = screen.getByRole("textbox", { name: "Complete route" });
  const parse = screen.getByRole("button", { name: "Parse route", exact: true });
  await expect.element(parse).toBeDisabled();
  await input.fill("  zbaa\n dct   zspd  ");
  expect(mocks.query).not.toHaveBeenCalled();
  await parse.click();
  expect(mocks.query).toHaveBeenLastCalledWith(
    "get",
    "/api/flights/route/v2",
    { params: { query: { route: "ZBAA DCT ZSPD" } } },
    { enabled: true, retry: false },
  );
  await expect.element(parse).toBeDisabled();
  await expect.element(screen.getByRole("button", { name: "Refresh", exact: true })).not.toBeInTheDocument();
  await input.fill("ZBAA ZSSS");
  expect(mocks.query.mock.calls.at(-1)?.[2]).toEqual({ params: { query: { route: "ZBAA DCT ZSPD" } } });
  await parse.click();
  expect(mocks.query.mock.calls.at(-1)?.[2]).toEqual({ params: { query: { route: "ZBAA ZSSS" } } });
  await input.fill(" \n ");
  await expect.element(parse).toBeDisabled();
});

test("shows parsing errors and highlights unknown fixes and legs in the result", async () => {
  mocks.query.mockReturnValue({ error: { title: "Invalid route", detail: "Missing arrival" }, refetch: mocks.refetch });
  const screen = await renderComponent(<RouteViewer />);
  await screen.getByRole("textbox", { name: "Complete route" }).fill("ZBAA");
  await screen.getByRole("button", { name: "Parse route", exact: true }).click();
  await expect.element(screen.getByText("Missing arrival")).toBeVisible();

  mocks.query.mockReturnValue({
    data: {
      legs: [
        {
          from: { identifier: "MISSING", latitude: null, longitude: null, is_unknown: true },
          to: { identifier: "UNKNOWN", latitude: null, longitude: null, is_unknown: true },
          leg_identifier: "NOLEG",
          is_unknown: true,
          is_sid: false,
          is_star: false,
        },
      ],
      sid_candidates: [
        { identifier: "BOTP7X", runway_transitions: ["36R", "01"], is_rnav: true },
        { identifier: "BOTP9Z", runway_transitions: ["36L"], is_rnav: true },
        { identifier: "CONV1A", runway_transitions: ["01"], is_rnav: false },
      ],
    },
    refetch: mocks.refetch,
  });
  await screen.getByRole("textbox", { name: "Complete route" }).fill("MISSING NOLEG UNKNOWN");
  await screen.getByRole("button", { name: "Parse route", exact: true }).click();
  await expect.element(screen.getByText("Missing arrival")).not.toBeInTheDocument();
  await expect.element(screen.getByText("MISSING", { exact: true })).toHaveClass("text-red-600");
  await expect.element(screen.getByText("NOLEG", { exact: true })).toHaveClass("text-red-600");
  await expect.element(screen.getByText("UNKNOWN", { exact: true })).toHaveClass("text-red-600");
  await expect.element(screen.getByText("No resolved coordinates are available to display on the map.")).toBeVisible();
  const runway01 = screen.getByRole("group", { name: "Runway 01", exact: true });
  await expect.element(runway01.getByText("BOTP7X")).toBeVisible();
  await expect.element(runway01.getByText("CONV1A")).toBeVisible();
  await expect.element(runway01.getByText("RNAV", { exact: true })).toBeVisible();
  await expect.element(runway01.getByText("Conventional", { exact: true })).toBeVisible();
  await expect.element(runway01.getByText("BOTP9Z")).not.toBeInTheDocument();
  const runway36R = screen.getByRole("group", { name: "Runway 36R", exact: true });
  await expect.element(runway36R.getByText("BOTP7X")).toBeVisible();
  await expect.element(runway36R.getByText("CONV1A")).not.toBeInTheDocument();
});

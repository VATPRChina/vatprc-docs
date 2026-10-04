import { RouteViewer } from "./route-viewer";
import { renderComponent } from "@/test/render-component";
import { beforeEach, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ permissions: vi.fn(), query: vi.fn(), refetch: vi.fn() }));
vi.mock("@/lib/client", () => ({ usePermissions: mocks.permissions, $api: { useQuery: mocks.query } }));

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
  await screen.getByRole("button", { name: "Refresh", exact: true }).click();
  expect(mocks.refetch).toHaveBeenCalledOnce();
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
    data: [
      {
        from: { identifier: "MISSING", latitude: null, longitude: null, is_unknown: true },
        to: { identifier: "UNKNOWN", latitude: null, longitude: null, is_unknown: true },
        leg_identifier: "NOLEG",
        is_unknown: true,
      },
    ],
    refetch: mocks.refetch,
  });
  await screen.getByRole("textbox", { name: "Complete route" }).fill("MISSING NOLEG UNKNOWN");
  await screen.getByRole("button", { name: "Parse route", exact: true }).click();
  await expect.element(screen.getByText("Missing arrival")).not.toBeInTheDocument();
  await expect.element(screen.getByRole("table")).toBeVisible();
  await expect.element(screen.getByText("Unresolved fixes", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("Unresolved legs", { exact: true })).toBeVisible();
  await expect.element(screen.getByRole("cell", { name: /NOLEG/ }).getByText("NOLEG")).toHaveClass("text-red-600");
  await expect.element(screen.getByRole("cell", { name: /UNKNOWN/ }).getByText("UNKNOWN")).toHaveClass("text-red-600");
});

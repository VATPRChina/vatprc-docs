import type { AtcPosition } from "./position-modal";
import { usePermission } from "@/lib/client";
import { StationPage } from "@/routes/_doc/airspace/station";
import { renderComponent } from "@/test/render-component";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, test, vi } from "vitest";

const { request } = vi.hoisted(() => ({ request: vi.fn<(request: Request) => Promise<Response>>() }));

vi.mock("@/lib/client", async () => {
  const { default: createClient } = await import("openapi-fetch");
  const { default: createQueryClient } = await import("openapi-react-query");
  return {
    $api: createQueryClient(createClient({ baseUrl: "https://test.invalid", fetch: request })),
    usePermission: vi.fn(() => true),
  };
});

const initialPosition: AtcPosition = {
  callsign: "ZBAA_TWR",
  category: "standard",
  frequency: 118.5,
  frequency_khz: 118500,
  is_tier_2: false,
  callsign_zh: "北京塔台",
  callsign_en: "Beijing Tower",
  cpdlc_code: "ZBAA",
  remarks: "Original remarks",
  created_at: "2026-09-01T00:00:00Z",
  updated_at: "2026-09-01T00:00:00Z",
};

let positions: AtcPosition[];
let writes: { method: string; path: string; body?: unknown }[];
let failWrite: boolean;
let failCallsign: string | undefined;

beforeEach(() => {
  positions = [{ ...initialPosition }];
  writes = [];
  failWrite = false;
  failCallsign = undefined;
  vi.mocked(usePermission).mockReturnValue(true);
  request.mockImplementation(async (req) => {
    const path = new URL(req.url).pathname;
    if (req.method === "GET") return Response.json(positions);
    const body = req.method === "DELETE" ? undefined : ((await req.json()) as AtcPosition);
    writes.push({ method: req.method, path, body });
    if (failWrite || (failCallsign && (body?.callsign === failCallsign || path.endsWith(`/${failCallsign}`))))
      return Response.json({ title: "Conflict", detail: "Callsign already exists" }, { status: 409 });
    if (req.method === "DELETE") {
      positions = positions.filter((p) => !path.endsWith(p.callsign));
      return new Response(null, { status: 204 });
    }
    const saved = { ...initialPosition, ...body, frequency_khz: Math.round(body!.frequency * 1000) };
    positions =
      req.method === "POST"
        ? [...positions, saved]
        : positions.map((position) => (position.callsign === saved.callsign ? saved : position));
    return Response.json(saved);
  });
});

const renderPage = () =>
  renderComponent(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <StationPage />
    </QueryClientProvider>,
  );

test("read-only visitors can see positions without management controls", async () => {
  vi.mocked(usePermission).mockReturnValue(false);
  const screen = await renderPage();
  await expect.element(screen.getByText("ZBAA_TWR", { exact: true })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "Create ATC Position" })).not.toBeInTheDocument();
  await expect.element(screen.getByRole("button", { name: "Delete selected (0)" })).not.toBeInTheDocument();
  await expect.element(screen.getByRole("checkbox")).not.toBeInTheDocument();
  await expect.element(screen.getByRole("button", { name: "Batch Create ATC Positions" })).not.toBeInTheDocument();
  await expect.element(screen.getByRole("button", { name: "Edit", exact: true })).not.toBeInTheDocument();
  await expect.element(screen.getByRole("button", { name: "Delete", exact: true })).not.toBeInTheDocument();
});

test("create validates callsign and channel, sends normalized data and refreshes the list", async () => {
  const screen = await renderPage();
  await screen.getByRole("button", { name: "Create ATC Position" }).click();
  const dialog = screen.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "Callsign", exact: true }).fill("ZBAA TWR");
  await dialog.getByRole("spinbutton").fill("118.500");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  expect(writes).toHaveLength(0);
  await dialog.getByRole("textbox", { name: "Callsign", exact: true }).fill("zbaa_gnd");
  for (const frequency of ["", "117.995", "136.980", "121.823", "121.8251"]) {
    await dialog.getByRole("spinbutton").fill(frequency);
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    expect(writes).toHaveLength(0);
  }
  await dialog.getByRole("spinbutton").fill("121.825");
  await dialog.getByRole("checkbox", { name: "Tier 2" }).click();
  await dialog.getByRole("textbox", { name: "Chinese Callsign" }).fill(" 北京地面 ");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect.element(screen.getByText("ZBAA_GND", { exact: true })).toBeVisible();
  expect(writes).toEqual([
    {
      method: "POST",
      path: "/api/atc/positions",
      body: {
        callsign: "ZBAA_GND",
        category: "standard",
        frequency: 121.825,
        is_tier_2: true,
        callsign_zh: "北京地面",
        callsign_en: null,
        cpdlc_code: null,
        remarks: null,
      },
    },
  ]);
});

test("editing preserves identity and input on failure, and supports clearing optional fields", async () => {
  const screen = await renderPage();
  await screen.getByRole("button", { name: "Edit", exact: true }).click();
  const dialog = screen.getByRole("dialog");
  await expect.element(dialog.getByRole("textbox", { name: "Callsign", exact: true })).toBeDisabled();
  await expect.element(dialog.getByRole("spinbutton")).toHaveValue(118.5);
  await dialog.getByRole("textbox", { name: "Remarks", exact: true }).fill("");
  await dialog.getByRole("spinbutton").fill("131.010");
  failWrite = true;
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect.element(dialog.getByText("Callsign already exists")).toBeVisible();
  await expect.element(dialog.getByRole("spinbutton")).toHaveValue(131.01);
  failWrite = false;
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect.element(screen.getByRole("cell", { name: "131.010", exact: true })).toBeVisible();
  expect(writes.at(-1)).toMatchObject({
    method: "PUT",
    path: "/api/atc/positions/ZBAA_TWR",
    body: {
      callsign: "ZBAA_TWR",
      callsign_en: "Beijing Tower",
      frequency: 131.01,
      remarks: null,
    },
  });
});

test("deletion requires confirmation, supports cancel and refreshes the list", async () => {
  const screen = await renderPage();
  await screen.getByRole("button", { name: "Delete", exact: true }).click();
  await screen.getByRole("dialog").getByRole("button", { name: "Cancel" }).click();
  expect(writes).toHaveLength(0);
  await screen.getByRole("button", { name: "Delete", exact: true }).click();
  await screen.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
  await expect.element(screen.getByText("No data", { exact: true })).toBeVisible();
  expect(writes).toEqual([{ method: "DELETE", path: "/api/atc/positions/ZBAA_TWR", body: undefined }]);
});

test("batch deletion confirms selected positions, retains failures and retries only failed deletions", async () => {
  positions.push({ ...initialPosition, callsign: "ZBAA_GND" }, { ...initialPosition, callsign: "ZBAA_DEL" });
  const screen = await renderPage();
  await expect.element(screen.getByRole("button", { name: "Delete selected (0)" })).toBeDisabled();
  await expect.element(screen.getByRole("button", { name: "Batch Edit ATC Positions" })).not.toBeInTheDocument();
  await screen.getByRole("checkbox", { name: "Select ZBAA_TWR", exact: true }).click();
  await screen.getByRole("checkbox", { name: "Select ZBAA_GND", exact: true }).click();
  await screen.getByRole("button", { name: "Delete selected (2)" }).click();
  let dialog = screen.getByRole("dialog");
  await expect.element(dialog.getByText("ZBAA_TWR", { exact: true })).toBeVisible();
  await expect.element(dialog.getByText("ZBAA_DEL", { exact: true })).not.toBeInTheDocument();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  expect(writes).toHaveLength(0);
  await screen.getByRole("button", { name: "Delete selected (2)" }).click();
  dialog = screen.getByRole("dialog");
  failCallsign = "ZBAA_GND";
  await dialog.getByRole("button", { name: "Delete 2 positions" }).click();
  await expect.element(dialog.getByText("Callsign already exists")).toBeVisible();
  await expect.element(dialog.getByRole("button", { name: "Delete 1 positions" })).toBeEnabled();
  await expect.element(screen.getByRole("button", { name: "Delete selected (1)" })).toBeVisible();
  expect(writes.map((write) => write.path)).toEqual(["/api/atc/positions/ZBAA_TWR", "/api/atc/positions/ZBAA_GND"]);
  failCallsign = undefined;
  await dialog.getByRole("button", { name: "Delete 1 positions" }).click();
  await expect.element(dialog).not.toBeInTheDocument();
  expect(writes).toHaveLength(3);
  expect(writes[2]).toMatchObject({ method: "DELETE", path: "/api/atc/positions/ZBAA_GND" });
  await expect.element(screen.getByText("ZBAA_DEL", { exact: true })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "Delete selected (0)" })).toBeDisabled();
});

test("page selection and deselection preserve selections across pagination", async () => {
  positions = Array.from({ length: 51 }, (_, index) => ({ ...initialPosition, callsign: `TEST_${index}_TWR` }));
  const screen = await renderPage();
  await screen.getByRole("checkbox", { name: "Select TEST_0_TWR", exact: true }).click();
  await expect
    .element(screen.getByRole("checkbox", { name: "Select all positions on this page" }))
    .toBePartiallyChecked();
  await screen.getByRole("button", { name: "Go to next page" }).click();
  await expect.element(screen.getByRole("checkbox", { name: "Select TEST_50_TWR", exact: true })).not.toBeChecked();
  await screen.getByRole("checkbox", { name: "Select all positions on this page" }).click();
  await expect.element(screen.getByRole("button", { name: "Delete selected (2)" })).toBeEnabled();
  await screen.getByRole("button", { name: "Go to previous page" }).click();
  await expect.element(screen.getByRole("checkbox", { name: "Select TEST_0_TWR", exact: true })).toBeChecked();
  await screen.getByRole("checkbox", { name: "Select all positions on this page" }).click();
  await expect.element(screen.getByRole("button", { name: "Delete selected (51)" })).toBeEnabled();
  await screen.getByRole("checkbox", { name: "Select all positions on this page" }).click();
  await expect.element(screen.getByRole("button", { name: "Delete selected (1)" })).toBeEnabled();
  expect(writes).toHaveLength(0);
});

test("batch create validates rows and duplicate callsigns and retries only failed creations", async () => {
  const screen = await renderPage();
  await screen.getByRole("button", { name: "Batch Create ATC Positions" }).click();
  const dialog = screen.getByRole("dialog");
  await dialog.getByRole("button", { name: "Save 1 positions" }).click();
  expect(writes).toHaveLength(0);
  await dialog.getByRole("textbox", { name: "Callsign row 1" }).fill("zbaa_gnd");
  await dialog.getByRole("spinbutton", { name: "Frequency (MHz) ZBAA_GND" }).fill("121.825");
  await dialog.getByRole("button", { name: "Add position" }).click();
  await dialog.getByRole("textbox", { name: "Callsign row 2" }).fill("ZBAA_GND");
  await dialog.getByRole("spinbutton", { name: "Frequency (MHz) ZBAA_GND" }).nth(1).fill("118.500");
  await dialog.getByRole("button", { name: "Save 2 positions" }).click();
  await expect.element(dialog.getByText("Duplicate callsign").first()).toBeVisible();
  expect(writes).toHaveLength(0);
  await dialog.getByRole("textbox", { name: "Callsign row 2" }).fill("ZBAA_DEL");
  failCallsign = "ZBAA_DEL";
  await dialog.getByRole("button", { name: "Save 2 positions" }).click();
  await expect.element(dialog.getByText("Callsign already exists")).toBeVisible();
  await expect.element(dialog.getByRole("button", { name: "Save 1 positions" })).toBeEnabled();
  expect(writes.map((write) => (write.body as AtcPosition).callsign)).toEqual(["ZBAA_GND", "ZBAA_DEL"]);
  failCallsign = undefined;
  await dialog.getByRole("button", { name: "Save 1 positions" }).click();
  await expect.element(dialog).not.toBeInTheDocument();
  expect(writes).toHaveLength(3);
  expect(writes[2]).toMatchObject({ method: "POST", body: { callsign: "ZBAA_DEL", frequency: 118.5 } });
});

test("batch create can remove draft rows and cancel without saving", async () => {
  const screen = await renderPage();
  await screen.getByRole("button", { name: "Batch Create ATC Positions" }).click();
  const dialog = screen.getByRole("dialog");
  await dialog.getByRole("button", { name: "Add position" }).click();
  await dialog.getByRole("button", { name: "Remove row" }).first().click();
  await expect.element(dialog.getByRole("textbox", { name: "Callsign row 2" })).not.toBeInTheDocument();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  expect(writes).toHaveLength(0);
});

test("select all respects filters and keeps previously selected hidden positions", async () => {
  positions.push({ ...initialPosition, callsign: "ZBAA_GND" }, { ...initialPosition, callsign: "ZBAA_DEL" });
  const screen = await renderPage();
  await screen.getByRole("checkbox", { name: "Select ZBAA_TWR", exact: true }).click();
  const filter = screen.getByRole("textbox").first();
  await filter.fill("ZBAA_GND");
  await expect.element(screen.getByRole("checkbox", { name: "Select ZBAA_TWR", exact: true })).not.toBeInTheDocument();
  await screen.getByRole("checkbox", { name: "Select all positions on this page" }).click();
  await expect.element(screen.getByRole("button", { name: "Delete selected (2)" })).toBeEnabled();
  await filter.fill("");
  await expect.element(screen.getByRole("checkbox", { name: "Select ZBAA_TWR", exact: true })).toBeChecked();
  await expect.element(screen.getByRole("checkbox", { name: "Select ZBAA_GND", exact: true })).toBeChecked();
  await expect.element(screen.getByRole("checkbox", { name: "Select ZBAA_DEL", exact: true })).not.toBeChecked();
  expect(writes).toHaveLength(0);
});

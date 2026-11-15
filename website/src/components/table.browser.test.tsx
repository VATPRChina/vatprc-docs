import { RichTable, RichTableFeatures } from "./table";
import { renderComponent } from "@/test/render-component";
import { createColumnHelper } from "@tanstack/react-table";
import { expect, test } from "vitest";

const columnHelper = createColumnHelper<RichTableFeatures, { name: string }>();
const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    sortFn: (a, b) => b.original.name.localeCompare(a.original.name),
  }),
];

test("updates rows and pagination when sorting and filtering", async () => {
  const screen = await renderComponent(
    <RichTable
      columns={columns}
      data={[{ name: "Alpha" }, { name: "Bravo" }, { name: "Charlie" }]}
      initialState={{ pagination: { pageIndex: 0, pageSize: 2 }, sorting: [{ id: "name", desc: false }] }}
    />,
  );

  await expect.element(screen.getByRole("rowgroup").nth(1).getByRole("cell").first()).toHaveTextContent("Charlie");
  await expect.element(screen.getByText("Page 1 of 2")).toBeVisible();

  await screen.getByRole("button", { name: "Name", exact: true }).click();
  await expect.element(screen.getByRole("rowgroup").nth(1).getByRole("cell").first()).toHaveTextContent("Alpha");

  await screen.getByRole("button", { name: "Go to next page" }).click();
  await expect.element(screen.getByRole("rowgroup").nth(1).getByRole("cell").first()).toHaveTextContent("Charlie");
  await expect.element(screen.getByText("Page 2 of 2")).toBeVisible();

  await screen.getByPlaceholder("Search...").fill("bravo");
  await expect.element(screen.getByRole("rowgroup").nth(1).getByRole("cell").first()).toHaveTextContent("Bravo");
  await expect.element(screen.getByText("Page 1 of 1")).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "Go to next page" })).toBeDisabled();

  await screen.getByPlaceholder("Search...").fill("");
  await screen.getByRole("textbox").nth(1).fill("alpha");
  await expect.element(screen.getByRole("rowgroup").nth(1).getByRole("cell").first()).toHaveTextContent("Alpha");
  await expect.element(screen.getByText("Page 1 of 1")).toBeVisible();

  await screen.getByRole("textbox").nth(1).fill("missing");
  await expect.element(screen.getByText("No data", { exact: true })).toBeVisible();
});

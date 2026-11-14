import { DateTimeInput } from "./datetime-input";
import { renderComponent } from "@/test/render-component";
import { useState } from "react";
import { expect, test } from "vitest";

function UtcTimePicker() {
  const [value, setValue] = useState<string | null>("2026-11-14T12:00:00Z");
  return (
    <>
      <DateTimeInput aria-label="Start at (UTC)" value={value} onChange={setValue} />
      <output>{value ?? "none"}</output>
    </>
  );
}

test("displays and edits aviation times in UTC and supports clearing", async () => {
  const screen = await renderComponent(<UtcTimePicker />);
  const input = screen.getByLabelText("Start at (UTC)");
  await expect.element(input).toHaveValue("2026-11-14T12:00");
  await input.fill("2026-11-15T03:30");
  await expect.element(screen.getByRole("status")).toHaveTextContent("2026-11-15T03:30:00.000Z");
  await input.fill("");
  await expect.element(screen.getByRole("status")).toHaveTextContent("none");
});

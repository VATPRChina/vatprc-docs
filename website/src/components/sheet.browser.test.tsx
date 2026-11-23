import { Sheet } from "./sheet";
import { components } from "@/lib/api";
import { renderComponent } from "@/test/render-component";
import { useState } from "react";
import { expect, test, vi } from "vitest";

vi.mock("@tanstack/react-start", () => ({
  createIsomorphicFn: () => ({ server: () => ({ client: (fn: () => unknown) => fn }) }),
}));
vi.mock("@tanstack/react-start/server", () => ({ getRequestUrl: () => new URL("http://localhost/") }));

const sheet: components["schemas"]["SheetDto"] = {
  id: "exam-record-s1",
  name: "Exam record",
  fields: [
    {
      sheet_id: "exam-record-s1",
      id: "position",
      sequence: 0,
      name_zh: "席位",
      name_en: "Position",
      kind: "short-text",
      single_choice_options: [],
      is_deleted: false,
    },
    {
      sheet_id: "exam-record-s1",
      id: "score",
      sequence: 1,
      name_zh: "评分",
      name_en: "Score",
      kind: "single-choice",
      single_choice_options: ["N/A", "I", "S", "G"],
      is_deleted: false,
    },
    {
      sheet_id: "exam-record-s1",
      id: "remarks",
      sequence: 2,
      name_zh: "备注",
      name_en: "Remarks",
      kind: "long-text",
      single_choice_options: [],
      is_deleted: false,
    },
  ],
};

test("submits standard choice fields with blank optional remarks after clearing them", async () => {
  const onSubmit = vi.fn<(answers: { id: string; answer: string }[]) => Promise<void>>();
  const screen = await renderComponent(
    <Sheet sheet={sheet} optionalFieldIds={["remarks"]} onSubmit={onSubmit} submitButtonContent="Save" />,
  );
  await screen.getByRole("textbox", { name: "Position" }).fill("ZBAA_GND");
  await screen.getByRole("combobox", { name: "Score" }).click();
  await screen.getByRole("option", { name: "N/A", exact: true }).click();
  await screen.getByRole("textbox", { name: "Remarks" }).fill("Draft remark");
  await screen.getByRole("textbox", { name: "Remarks" }).fill("");
  await screen.getByRole("button", { name: "Save" }).click();
  await expect
    .poll(() => onSubmit.mock.calls[0]?.[0])
    .toEqual([
      { id: "position", answer: "ZBAA_GND" },
      { id: "score", answer: "N/A" },
      { id: "remarks", answer: "" },
    ]);
});

test("validates untouched required fields on submission", async () => {
  const onSubmit = vi.fn<(answers: { id: string; answer: string }[]) => Promise<void>>();
  const screen = await renderComponent(
    <Sheet
      sheet={sheet}
      optionalFieldIds={["remarks"]}
      onSubmit={onSubmit}
      doNotRequirePristine
      submitButtonContent="Save"
    />,
  );
  await screen.getByRole("button", { name: "Save" }).click();
  await expect.element(screen.getByText("The field must not be empty.").first()).toBeVisible();
  expect(onSubmit).not.toHaveBeenCalled();
});

function LevelSwitch() {
  const [level, setLevel] = useState("S1");
  const [saved, setSaved] = useState<Record<string, Record<string, string>>>({});
  return (
    <>
      <button onClick={() => setLevel(level === "S1" ? "S2" : "S1")}>Switch level</button>
      <Sheet
        key={level}
        sheet={sheet}
        existingFillingAnswers={sheet.fields.map((field) => ({ field, answer: saved[level]?.[field.id] ?? "" }))}
        onValuesChange={(values) => setSaved((current) => ({ ...current, [level]: values }))}
      />
    </>
  );
}

test("restores per-level answers through the shared values callback", async () => {
  const screen = await renderComponent(<LevelSwitch />);
  await screen.getByRole("textbox", { name: "Position" }).fill("ZBAA_GND");
  await screen.getByRole("button", { name: "Switch level" }).click();
  await expect.element(screen.getByRole("textbox", { name: "Position" })).toHaveValue("");
  await screen.getByRole("textbox", { name: "Position" }).fill("ZBAA_TWR");
  await screen.getByRole("button", { name: "Switch level" }).click();
  await expect.element(screen.getByRole("textbox", { name: "Position" })).toHaveValue("ZBAA_GND");
});

test("renders saved answers with the standard read-only sheet view", async () => {
  const screen = await renderComponent(
    <Sheet
      sheet={sheet}
      existingFillingAnswers={sheet.fields.map((field) => ({ field, answer: field.id === "score" ? "G" : "" }))}
      isSubmitHidden
    />,
  );
  await expect.element(screen.getByText("G", { exact: true })).toBeVisible();
  await expect.element(screen.getByRole("textbox")).not.toBeInTheDocument();
  await expect.element(screen.getByRole("button")).not.toBeInTheDocument();
});

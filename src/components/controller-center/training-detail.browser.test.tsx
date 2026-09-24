import { TrainingDetail } from "./training-detail";
import { components } from "@/lib/api";
import { renderComponent } from "@/test/render-component";
import { expect, test, vi } from "vitest";

vi.mock("@/lib/client", () => ({ useUser: () => ({ id: "mentor" }) }));
vi.mock("@/components/ui/link-button", () => ({
  LinkButton: ({ children }: { children: unknown }) => <a href="/controllers/trainings/training">{children}</a>,
}));

type Answer = components["schemas"]["SheetFieldAnswerDto"];
const answer = (id: string, name: string, text: string): Answer => ({
  field: {
    id,
    sheet_id: "test",
    name_zh: name,
    name_en: name,
    sequence: 0,
    kind: "long-text",
    single_choice_options: [],
    is_deleted: false,
  },
  answer: text,
});
const training = {
  id: "training",
  name: "Tower training",
  trainer_id: "mentor",
  trainee_id: "student",
  trainer: { full_name: "Trainer", cid: "1000001" },
  trainee: { full_name: "Student", cid: "1000002" },
  start_at: "2026-09-24T10:00:00Z",
  end_at: "2026-09-24T11:00:00Z",
  record_sheet_filing: [answer("feedback", "Coordination", "Good handoffs")],
  self_reflection_sheet_filing: [
    answer("reflection", "What I learned", "Improve scanning\nCoordinate sooner"),
    answer("plan", "Next steps", "Practice departures"),
  ],
} as components["schemas"]["TrainingDto"];

test("shows mentor feedback and all configured reflection answers read-only", async () => {
  const screen = await renderComponent(<TrainingDetail training={training} />);
  await expect.element(screen.getByRole("heading", { name: "Mentor Feedback" })).toBeVisible();
  await expect.element(screen.getByText("Good handoffs")).toBeVisible();
  await expect.element(screen.getByRole("heading", { name: "Self Reflection" })).toBeVisible();
  await expect
    .element(screen.getByRole("link", { name: "View training details" }))
    .toHaveAttribute("href", "/controllers/trainings/training");
  await expect.element(screen.getByText("What I learned")).toBeVisible();
  await expect.element(screen.getByText("Improve scanning Coordinate sooner")).toBeVisible();
  await expect.element(screen.getByText("Practice departures")).toBeVisible();
  await expect.element(screen.getByRole("textbox")).not.toBeInTheDocument();
  await expect.element(screen.getByRole("button", { name: "Save", exact: true })).not.toBeInTheDocument();
});

test("shows reflection even before the mentor has submitted feedback", async () => {
  const screen = await renderComponent(<TrainingDetail training={{ ...training, record_sheet_filing: null }} />);
  await expect.element(screen.getByText("No training record has been filed yet.")).toBeVisible();
  await expect.element(screen.getByText("Practice departures")).toBeVisible();
});

test("shows an empty reflection state alongside existing mentor feedback", async () => {
  const screen = await renderComponent(
    <TrainingDetail training={{ ...training, self_reflection_sheet_filing: null }} />,
  );
  await expect.element(screen.getByText("No self reflection has been filed yet.")).toBeVisible();
  await expect.element(screen.getByText("Good handoffs")).toBeVisible();
});

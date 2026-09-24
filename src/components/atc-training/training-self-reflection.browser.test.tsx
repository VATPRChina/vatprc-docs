import { TrainingSelfReflection } from "./training-self-reflection";
import { components } from "@/lib/api";
import { renderComponent } from "@/test/render-component";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, test, vi } from "vitest";

const state = vi.hoisted(() => ({
  userId: "trainee",
  save: vi.fn().mockResolvedValue(undefined),
}));
const field: components["schemas"]["SheetFieldDto"] = {
  sheet_id: "training-self-reflection",
  id: "reflection",
  sequence: 0,
  name_zh: "自我反思",
  name_en: "Self Reflection",
  kind: "long-text",
  single_choice_options: [],
  is_deleted: false,
};

vi.mock("@/lib/utils", () => ({
  promiseWithLog: (promise: Promise<unknown>) => void promise.catch(console.error),
  wrapPromiseWithLog: (callback: () => Promise<unknown>) => () => void callback().catch(console.error),
}));

vi.mock("@/lib/client", () => ({
  useUser: () => ({ id: state.userId }),
  $api: {
    useQuery: () => ({ data: { id: field.sheet_id, name: "Self Reflection", fields: [field] } }),
    useMutation: () => ({ mutateAsync: state.save }),
  },
}));

const training = {
  id: "training",
  trainee_id: "trainee",
  trainer_id: "mentor",
  self_reflection_sheet_filing: [{ field, answer: "Existing reflection" }],
} as components["schemas"]["TrainingDto"];

const renderReflection = () =>
  renderComponent(
    <QueryClientProvider client={new QueryClient()}>
      <TrainingSelfReflection training={training} />
    </QueryClientProvider>,
  );

beforeEach(() => {
  state.userId = "trainee";
  state.save.mockClear();
});

test("loads the saved reflection and submits edited text", async () => {
  const screen = await renderReflection();
  const input = screen.getByRole("textbox", { name: "Self Reflection" });
  await expect.element(input).toHaveValue("Existing reflection");
  await input.fill("Updated reflection\nNext steps");
  await screen.getByRole("button", { name: "Save", exact: true }).click();
  expect(state.save).toHaveBeenCalledWith({
    params: { path: { id: "training" } },
    body: { request_answers: [{ id: "reflection", answer: "Updated reflection\nNext steps" }] },
  });
});

test("shows the mentor read-only content without a save button", async () => {
  state.userId = "mentor";
  const screen = await renderReflection();
  await expect.element(screen.getByText("Existing reflection")).toBeVisible();
  await expect.element(screen.getByRole("textbox")).not.toBeInTheDocument();
  await expect.element(screen.getByRole("button", { name: "Save", exact: true })).not.toBeInTheDocument();
});

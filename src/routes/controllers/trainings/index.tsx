import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/controllers/trainings/")({
  beforeLoad: () => {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw redirect({ to: "/controllers", search: { view: "management" } });
  },
});

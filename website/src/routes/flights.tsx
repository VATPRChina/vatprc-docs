import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/flights")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto">
      <Outlet />
    </div>
  );
}

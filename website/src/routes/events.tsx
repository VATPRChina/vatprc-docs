import { createFileRoute, Outlet } from "@tanstack/react-router";
import type { FC } from "react";

const RouteComponent: FC = () => {
  return (
    <div className="container mx-auto">
      <Outlet />
    </div>
  );
};

export const Route = createFileRoute("/events")({
  component: RouteComponent,
});

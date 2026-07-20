import { MANAGEMENT_ROLES, TrainingManagement } from "@/components/controller-center/training-management";
import { $api } from "@/lib/client";
import { Skeleton } from "@mantine/core";
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/controllers/trainings/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session, isLoading } = $api.useQuery("get", "/api/session", {}, { retry: false });
  const roles = session?.user?.roles ?? [];

  if (isLoading) return <Skeleton h={320} />;
  if (!MANAGEMENT_ROLES.some((role) => roles.includes(role))) return <Navigate to="/controllers" replace />;

  return <TrainingManagement />;
}

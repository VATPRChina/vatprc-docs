import { useCenterRoles } from "@/components/controller-center/center-context";
import { TrainingManagement } from "@/components/controller-center/training-management";
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/controllers/trainings/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { canManageTrainings } = useCenterRoles();
  if (!canManageTrainings) return <Navigate to="/controllers" replace />;
  return <TrainingManagement />;
}

import { toast, Toast } from "@heroui/react";
import { ReactNode } from "react";

export const Notifications = () => <Toast.Provider placement="top" />;
export const notifications = {
  show: ({ title, message, color }: { title?: ReactNode; message?: ReactNode; color?: string }) =>
    toast(title ?? message, {
      description: title ? message : undefined,
      variant: color === "red" ? "danger" : "default",
    }),
};

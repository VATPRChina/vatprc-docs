import { redirectToLogin } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Button } from "@mantine/core";
import { TbLockAccess, TbLogin2 } from "react-icons/tb";

export const ControllerCenterLoginPlaceholder = () => (
  <section className="relative isolate flex min-h-80 items-center justify-center overflow-hidden border border-dashed border-black/20 bg-linear-to-br from-gray-50 via-white to-red-50 p-4 dark:border-white/20 dark:from-gray-950 dark:via-gray-950 dark:to-red-950/30">
    <div
      aria-hidden
      className="absolute -top-20 -right-20 size-56 rounded-full bg-red-200/30 blur-3xl dark:bg-red-900/20"
    />
    <div
      aria-hidden
      className="absolute -bottom-24 -left-16 size-56 rounded-full bg-gray-300/30 blur-3xl dark:bg-gray-700/20"
    />
    <div className="relative flex max-w-lg flex-col items-center gap-1 text-center">
      <div className="mb-1 flex size-16 items-center justify-center border border-red-200 bg-white/80 text-red-700 shadow-sm backdrop-blur dark:border-red-900 dark:bg-gray-950/80 dark:text-red-300">
        <TbLockAccess size={32} strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-medium">
        <Trans>Log in to Controller Center</Trans>
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        <Trans>Log in with your VATSIM account to view your controller training, applications, and bookings.</Trans>
      </p>
      <Button variant="subtle" color="red" rightSection={<TbLogin2 size={16} />} onClick={redirectToLogin}>
        <Trans>Login</Trans>
      </Button>
    </div>
  </section>
);

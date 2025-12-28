import { Trans } from "@lingui/react/macro";

export const AppFooter: React.FC = () => {
  return (
    <footer className="container mx-auto mt-8 mb-4">
      <p className="text-slate-500 dark:text-slate-300">
        <Trans>
          &copy; 2010 - 2025, VATSIM P.R. China Division. All rights reserved. Powered by Microsoft Azure, .NET,
          TanStack and shadcn/ui. For simulation use only.
        </Trans>
      </p>
    </footer>
  );
};

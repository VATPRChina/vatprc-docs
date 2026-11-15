import { Trans } from "@lingui/react/macro";

export const AppFooter: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="container mx-auto my-4 px-6">
      <p className="text-center text-slate-500 dark:text-slate-300">
        <Trans>&copy; 2010 - {year}, VATSIM P.R. China Division. All rights reserved. For simulation use only.</Trans>
      </p>
    </footer>
  );
};

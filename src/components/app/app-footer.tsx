import { Trans } from "@lingui/react/macro";
import { cn } from "cn";
import { ComponentProps, FC } from "react";

export const AppFooter: FC<ComponentProps<"div">> = ({ className, ...props }) => {
  const year = new Date().getFullYear();

  return (
    <footer className={cn("mt-4 p-4", className)} {...props}>
      <div className="container mx-auto">
        <p className="text-center">
          <Trans>&copy; 2010 - {year}, VATSIM P.R. China Division. All rights reserved. For simulation use only.</Trans>
        </p>
      </div>
    </footer>
  );
};

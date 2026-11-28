import { LinkButton } from "../ui/link-button";
import { Trans } from "@lingui/react/macro";

export const NotFound: React.FC = () => (
  <div className="container mx-auto">
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-dimmed text-3xl font-bold">404</h1>
      <h2 className="text-2xl font-bold">
        <Trans>Nothing to see here</Trans>
      </h2>
      <p className="text-dimmed text-lg">
        <Trans>
          Page you are trying to open does not exist. You may have mistyped the address, or the page has been moved to
          another URL.
        </Trans>
      </p>
      <LinkButton size="md" variant="light" to="/">
        <Trans>Take me back to home page</Trans>
      </LinkButton>
    </div>
  </div>
);

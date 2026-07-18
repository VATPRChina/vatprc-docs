import { LinkButton } from "@/components/ui/link-button";
import { Trans } from "@lingui/react/macro";
import { FC, ReactNode } from "react";

const Step: FC<{ index: number; title: ReactNode }> = ({ index, title }) => (
  <li className="flex flex-1 items-center gap-3 border border-gray-200 px-4 py-3 dark:border-gray-800">
    <span className="font-mono text-2xl font-bold text-red-700 dark:text-red-400">{index}</span>
    <span className="font-medium">{title}</span>
  </li>
);

export const BecomeController: FC = () => (
  <section className="flex flex-col gap-4">
    <h2 className="text-2xl font-medium">
      <Trans>Become a Controller</Trans>
    </h2>
    <p className="text-gray-700 dark:text-gray-300">
      <Trans>
        VATPRC provides a complete training program from Delivery to Center. Submit an application to start your
        controller journey.
      </Trans>
    </p>
    <ol className="flex flex-col gap-3 md:flex-row">
      <Step index={1} title={<Trans>Submit application</Trans>} />
      <Step index={2} title={<Trans>Staff review</Trans>} />
      <Step index={3} title={<Trans>Mentor assignment</Trans>} />
      <Step index={4} title={<Trans>Start training</Trans>} />
    </ol>
    <LinkButton className="self-start" color="red" to="/controllers/applications">
      <Trans>Apply Now</Trans>
    </LinkButton>
  </section>
);

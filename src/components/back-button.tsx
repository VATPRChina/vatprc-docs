import { LinkButton } from "./ui/link-button";
import { Trans } from "@lingui/react/macro";
import { FC } from "react";
import { TbArrowLeft } from "react-icons/tb";

export const BackButton: FC = () => (
  <LinkButton to=".." className="self-start" variant={"neutral"}>
    {<TbArrowLeft />}
    <Trans>Back</Trans>
  </LinkButton>
);

import { Trans } from "@lingui/react/macro";
import { Button } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { FC } from "react";
import { TbArrowLeft } from "react-icons/tb";

export const BackButton: FC = () => (
  <Button
    renderRoot={(props) => <Link to=".." {...props} />}
    variant="subtle"
    className="self-start"
    leftSection={<TbArrowLeft />}
  >
    <Trans>Back</Trans>
  </Button>
);

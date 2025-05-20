import { Card, CardProps } from "@mantine/core";
import { createLink, LinkComponent } from "@tanstack/react-router";
import * as React from "react";

type MantineCardProps = Omit<CardProps, "href">;

const MantineLinkComponent = React.forwardRef<
  HTMLAnchorElement,
  MantineCardProps
>((props, ref) => {
  return <Card component="a" ref={ref} {...props} />;
});
MantineLinkComponent.displayName = "MantineLinkComponent";

const CreatedCardComponent = createLink(MantineLinkComponent);

export const RouteCard: LinkComponent<typeof MantineLinkComponent> = (
  props,
) => {
  return <CreatedCardComponent preload="intent" {...props} />;
};

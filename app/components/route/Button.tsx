import { Button, ButtonProps } from "@mantine/core";
import { createLink, LinkComponent } from "@tanstack/react-router";
import * as React from "react";

type MantineButtonProps = Omit<ButtonProps, "href">;

const MantineLinkComponent = React.forwardRef<HTMLAnchorElement, MantineButtonProps>((props, ref) => {
  return <Button component="a" ref={ref} {...props} />;
});
MantineLinkComponent.displayName = "MantineLinkComponent";

const CreatedButtonComponent = createLink(MantineLinkComponent);

export const RouteButton: LinkComponent<typeof MantineLinkComponent> = (props) => {
  return <CreatedButtonComponent preload="intent" {...props} />;
};

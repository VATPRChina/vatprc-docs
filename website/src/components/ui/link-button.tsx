import { Button, ButtonProps, ElementProps } from "@mantine/core";
import { createLink, LinkComponent } from "@tanstack/react-router";
import * as React from "react";

interface MantineAnchorProps extends ButtonProps, ElementProps<"a", keyof ButtonProps> {}

const MantineLinkComponent = React.forwardRef<HTMLAnchorElement, MantineAnchorProps>((props, ref) => {
  return <Button component="a" ref={ref} {...props} />;
});
MantineLinkComponent.displayName = "MantineLinkComponent";

const CreatedLinkComponent = createLink(MantineLinkComponent);

export const LinkButton: LinkComponent<typeof MantineLinkComponent> = (props) => {
  return <CreatedLinkComponent preload="intent" {...props} />;
};

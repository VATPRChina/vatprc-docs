import { Button, ButtonProps, ElementProps } from "@/components/ui";
import { createLink, LinkComponent } from "@tanstack/react-router";
import * as React from "react";

interface HeroAnchorProps extends ButtonProps, ElementProps<"a", keyof ButtonProps> {}

const HeroLinkComponent = React.forwardRef<HTMLAnchorElement, HeroAnchorProps>((props, ref) => {
  return <Button component="a" ref={ref} {...props} />;
});
HeroLinkComponent.displayName = "HeroLinkComponent";

const CreatedLinkComponent = createLink(HeroLinkComponent);

export const LinkButton: LinkComponent<typeof HeroLinkComponent> = (props) => {
  return <CreatedLinkComponent preload="intent" {...props} />;
};

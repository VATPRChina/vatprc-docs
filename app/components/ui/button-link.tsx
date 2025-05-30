import { Button } from "./button";
import { createLink, LinkComponent } from "@tanstack/react-router";
import * as React from "react";

type LinkButtonComponentProps = React.ComponentProps<typeof Button>;

const LinkButtonComponent = React.forwardRef<HTMLButtonElement, LinkButtonComponentProps>((props, ref) => {
  return <Button ref={ref} {...props} />;
});
LinkButtonComponent.displayName = "LinkButtonComponent";

const CreatedLinkComponent = createLink(LinkButtonComponent);

export const LinkButton: LinkComponent<typeof LinkButtonComponent> = (props) => {
  return <CreatedLinkComponent preload={"intent"} {...props} />;
};

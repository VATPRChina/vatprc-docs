import { Button } from "@/components/ui/button";
import { createLink } from "@tanstack/react-router";
import { forwardRef, type ComponentProps } from "react";

const AnchorButton = forwardRef<
  HTMLAnchorElement,
  Omit<ComponentProps<typeof Button>, "render" | "nativeButton"> & ComponentProps<"a">
>((props, ref) => <Button render={<a ref={ref} />} nativeButton={false} {...props} />);
AnchorButton.displayName = "AnchorButton";
export const LinkButton = createLink(AnchorButton);

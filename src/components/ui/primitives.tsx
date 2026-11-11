import {
  Alert as HeroAlert,
  Button as HeroButton,
  buttonVariants,
  Card as HeroCard,
  Chip,
  Separator,
  Skeleton as HeroSkeleton,
  Spinner,
} from "@heroui/react";
import clsx from "clsx";
import React, { CSSProperties, ElementType, ReactNode } from "react";

export type StatusColor = string;
export interface CommonProps extends React.AriaAttributes {
  children?: ReactNode;
  c?: string;
  padding?: string | number;
  className?: string;
  style?: CSSProperties;
  size?: string | number;
  color?: string;
  variant?: string;
  radius?: string | number;
  p?: string | number;
  px?: string | number;
  py?: string | number;
  mt?: string | number;
  mb?: string | number;
  w?: string | number;
  h?: string | number;
  maw?: string | number;
  mx?: string | number;
}
export function layoutStyle({ p, px, py, mt, mb, w, h, maw, mx, style, padding }: CommonProps): CSSProperties {
  const space = (value?: string | number) =>
    typeof value === "string" ? ({ xs: 8, sm: 12, md: 16, lg: 24, xl: 32 }[value] ?? value) : value;
  return {
    padding: space(p ?? padding),
    paddingInline: space(px),
    paddingBlock: space(py),
    marginTop: space(mt),
    marginBottom: space(mb),
    marginInline: space(mx),
    width: w,
    height: h,
    maxWidth: maw,
    ...style,
  };
}
export const intent = (color?: string) =>
  color === "red"
    ? "danger"
    : color === "green" || color === "teal"
      ? "success"
      : color === "yellow" || color === "orange"
        ? "warning"
        : color === "gray" || color === "grey" || color === "dark"
          ? "default"
          : "accent";
export interface ButtonProps
  extends
    CommonProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps | "ref" | "onFocus" | "onBlur"> {
  onFocus?: React.FocusEventHandler<Element>;
  onBlur?: React.FocusEventHandler<Element>;
  component?: ElementType;
  href?: string;
  to?: string;
  params?: Record<string, string>;
  search?: Record<string, unknown>;
  target?: string;
  rel?: string;
  loading?: boolean;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
  fullWidth?: boolean;
  justify?: string;
  ref?: React.Ref<HTMLElement>;
}
export type ElementProps<T extends keyof React.JSX.IntrinsicElements, O extends PropertyKey = never> = Omit<
  React.ComponentPropsWithoutRef<T>,
  O
>;
export type PolymorphicComponentProps<T extends keyof React.JSX.IntrinsicElements, P> = P &
  Omit<React.ComponentPropsWithoutRef<T>, keyof P>;
export function Button({
  children,
  component,
  loading,
  disabled,
  leftSection,
  rightSection,
  variant,
  color,
  size,
  radius,
  fullWidth,
  justify,
  className,
  style,
  ref,
  onClick,
  value,
  ...rest
}: ButtonProps) {
  const v =
    variant === "subtle" || variant === "transparent"
      ? "ghost"
      : variant === "outline"
        ? "outline"
        : variant === "light" || variant === "default"
          ? "secondary"
          : color === "red"
            ? "danger"
            : "primary";
  const buttonSize =
    size === "lg" || size === "xl" ? "lg" : size === "xs" || String(size).startsWith("compact") ? "sm" : "md";
  const content = (
    <>
      {loading ? (
        <span aria-hidden="true">
          <Spinner size="sm" />
        </span>
      ) : (
        leftSection
      )}
      {children}
      {rightSection}
    </>
  );
  if (component) {
    return React.createElement(
      component,
      {
        ...rest,
        ref,
        className: clsx(buttonVariants({ variant: v, size: buttonSize, fullWidth }), "app-button", className),
        style: { borderRadius: radius, justifyContent: justify, ...style },
        "aria-disabled": disabled || loading || undefined,
        "aria-busy": loading || undefined,
        tabIndex: disabled || loading ? -1 : rest.tabIndex,
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
          if (disabled || loading) event.preventDefault();
          else onClick?.(event);
        },
      },
      content,
    );
  }
  return (
    <HeroButton
      {...rest}
      value={typeof value === "string" ? value : value === undefined ? undefined : String(value)}
      onClick={onClick as React.ComponentProps<typeof HeroButton>["onClick"]}
      ref={ref as React.Ref<HTMLButtonElement>}
      variant={v}
      size={size === "lg" || size === "xl" ? "lg" : size === "xs" || String(size).startsWith("compact") ? "sm" : "md"}
      fullWidth={fullWidth}
      isDisabled={disabled || loading}
      className={clsx("app-button", className)}
      style={{ borderRadius: radius, justifyContent: justify, ...style }}
      aria-busy={loading || undefined}
    >
      {content}
    </HeroButton>
  );
}
export const ActionIcon = (props: ButtonProps) => (
  <Button
    {...props}
    aria-label={props["aria-label"] ?? props.title}
    className={clsx("app-icon-button aspect-square shrink-0 p-2", props.className)}
  />
);
export const ButtonGroup = ({ children, className }: CommonProps) => (
  <div className={clsx("flex flex-wrap items-center gap-1", className)}>{children}</div>
);
export const ActionIconGroup = ButtonGroup;
export const UnstyledButton = ({ component: Component = "button", children, ...props }: ButtonProps) => (
  <Component {...props}>{children}</Component>
);
export function Alert({
  title,
  icon,
  children,
  color,
  className,
  ...props
}: CommonProps & { title?: ReactNode; icon?: ReactNode; role?: string }) {
  const titleId = React.useId();
  return (
    <HeroAlert
      status={
        color === "red"
          ? "danger"
          : color === "green"
            ? "success"
            : color === "yellow" || color === "orange"
              ? "warning"
              : "default"
      }
      className={className}
      role={props.role ?? "alert"}
      aria-labelledby={title ? titleId : undefined}
      style={layoutStyle(props)}
    >
      {icon && <HeroAlert.Indicator>{icon}</HeroAlert.Indicator>}
      <HeroAlert.Content>
        {title && <HeroAlert.Title id={titleId}>{title}</HeroAlert.Title>}
        {children && <div className="text-sm">{children}</div>}
      </HeroAlert.Content>
    </HeroAlert>
  );
}
export function Badge({
  component: Component,
  children,
  color,
  className,
  variant,
  size,
  radius,
  ...rest
}: CommonProps & { component?: ElementType; type?: "button"; onClick?: React.MouseEventHandler<HTMLButtonElement> }) {
  const chip = (
    <Chip
      color={intent(color)}
      variant={variant === "outline" ? "soft" : variant === "filled" ? "primary" : "secondary"}
      className={className}
      size={size === "lg" ? "lg" : "sm"}
      style={{ borderRadius: radius }}
    >
      {children}
    </Chip>
  );
  return Component ? <Component {...rest}>{chip}</Component> : chip;
}
export const Pill = Badge;
export function Card(
  props: CommonProps & {
    withBorder?: boolean;
    shadow?: string;
    component?: ElementType;
    to?: string;
    href?: string;
    target?: string;
    rel?: string;
    onClick?: React.MouseEventHandler;
  },
) {
  const { children, className, component, onClick } = props;
  return (
    <HeroCard
      render={
        component
          ? (domProps) =>
              React.createElement(component, {
                ...domProps,
                to: props.to,
                href: props.href,
                target: props.target,
                rel: props.rel,
                "aria-label": props["aria-label"],
                "aria-labelledby": props["aria-labelledby"],
              })
          : undefined
      }
      onClick={onClick}
      className={clsx(props.withBorder && "border-separator border", className)}
      style={layoutStyle(props)}
    >
      {children}
    </HeroCard>
  );
}
Card.Section = function CardSection({
  children,
  className,
}: CommonProps & { inheritPadding?: boolean; withBorder?: boolean }) {
  return <div className={className}>{children}</div>;
};
Card.Footer = HeroCard.Footer;
export const Paper = Card;
export function Skeleton({
  children,
  visible = true,
  width,
  height,
  className,
  ...props
}: CommonProps & { visible?: boolean; width?: string | number; height?: string | number; animate?: boolean }) {
  if (!visible) return <>{children}</>;
  return (
    <HeroSkeleton className={clsx("min-h-4", className)} style={{ width, height, ...layoutStyle(props) }}>
      <div className="invisible">{children}</div>
    </HeroSkeleton>
  );
}
export const Loader = ({ size }: CommonProps) => <Spinner size={size === "sm" || size === "xs" ? "sm" : "md"} />;
export const LoadingOverlay = ({ visible }: { visible?: boolean; zIndex?: number; overlayProps?: object }) =>
  visible ? (
    <div className="bg-background/70 absolute inset-0 z-10 flex items-center justify-center">
      <Spinner />
    </div>
  ) : null;
export const Divider = () => <Separator />;
interface AnchorProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  component?: ElementType;
  size?: string;
  renderRoot?: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => ReactNode;
}
export function Anchor({ component: Component = "a", children, className, renderRoot, size, ...props }: AnchorProps) {
  const linkProps = {
    ...props,
    style: { fontSize: size === "sm" ? "0.875rem" : undefined, ...props.style },
    className: clsx("text-accent underline-offset-2 hover:underline", className),
    children,
  };
  return renderRoot ? renderRoot(linkProps) : <Component {...linkProps} />;
}
export const Text = ({
  children,
  className,
  component: Component = "p",
  c,
  fw,
  ta,
  ...props
}: CommonProps & {
  component?: ElementType;
  c?: string;
  fw?: number;
  ta?: CSSProperties["textAlign"];
  inline?: boolean;
}) => (
  <Component
    className={clsx(c === "dimmed" && "text-muted", className)}
    style={{ ...layoutStyle(props), fontWeight: fw, textAlign: ta }}
  >
    {children}
  </Component>
);
export const Title = ({ order = 1, children, className }: CommonProps & { order?: 1 | 2 | 3 | 4 | 5 | 6 }) =>
  React.createElement(
    `h${order}`,
    { className: clsx("font-semibold", order === 1 ? "text-3xl" : "text-xl", className) },
    children,
  );
export const Code = ({ children, block }: CommonProps & { block?: boolean }) =>
  block ? (
    <pre className="bg-default overflow-auto rounded p-2 font-mono text-xs">
      <code>{children}</code>
    </pre>
  ) : (
    <code className="bg-default rounded px-1 font-mono text-xs">{children}</code>
  );
interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fit?: string;
  fallbackSrc?: string;
}
export const Image = ({ alt = "", ...props }: ImageProps) => <img alt={alt} {...props} />;
export const VisuallyHidden = ({ children }: CommonProps) => <span className="sr-only">{children}</span>;
export const ScrollArea = ({
  children,
  className,
  ...props
}: CommonProps & { offsetScrollbars?: boolean; scrollbarSize?: number; type?: string }) => (
  <div className={clsx("overflow-auto", className)} style={layoutStyle(props)}>
    {children}
  </div>
);
ScrollArea.Autosize = ScrollArea;
export function Spoiler({
  children,
  maxHeight,
  showLabel,
  hideLabel,
}: CommonProps & { maxHeight: number; showLabel: ReactNode; hideLabel: ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <div style={{ maxHeight: open ? undefined : maxHeight, overflow: "hidden" }}>{children}</div>
      <Button variant="subtle" size="xs" onClick={() => setOpen(!open)}>
        {open ? hideLabel : showLabel}
      </Button>
    </div>
  );
}
export const Indicator = ({
  children,
  disabled,
  color,
}: CommonProps & { disabled?: boolean; offset?: number; position?: string }) => (
  <div className="relative">
    {children}
    {!disabled && (
      <span
        className="bg-success absolute top-1 right-1 size-2 rounded-full"
        style={{ backgroundColor: color === "green" ? "var(--success)" : color }}
      />
    )}
  </div>
);

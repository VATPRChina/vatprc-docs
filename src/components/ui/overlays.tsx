import { Button, CommonProps } from "./primitives";
import {
  Accordion as HeroAccordion,
  Modal as HeroModal,
  Popover as HeroPopover,
  Tabs as HeroTabs,
  Tooltip as HeroTooltip,
} from "@heroui/react";
import clsx from "clsx";
import React, { createContext, ReactElement, ReactNode, useContext, useEffect, useRef } from "react";

interface ModalProps extends CommonProps {
  opened: boolean;
  onClose: () => void;
  title?: ReactNode;
  position?: string;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  centered?: boolean;
  overlayProps?: object;
  zIndex?: number;
  withCloseButton?: boolean;
  onClick?: React.MouseEventHandler;
}
export function Modal({
  opened,
  onClose,
  title,
  children,
  size,
  className,
  closeOnClickOutside = true,
  closeOnEscape = true,
  withCloseButton = true,
}: ModalProps) {
  return (
    <HeroModal.Backdrop
      isOpen={opened}
      onOpenChange={(open) => !open && onClose()}
      isDismissable={closeOnClickOutside}
      isKeyboardDismissDisabled={!closeOnEscape}
    >
      <HeroModal.Container size={size === "xl" ? "lg" : size === "lg" ? "lg" : "md"} scroll="inside">
        <HeroModal.Dialog className={className} aria-label={typeof title === "string" ? title : "Dialog"}>
          {withCloseButton && <HeroModal.CloseTrigger aria-label="Close" />}
          <HeroModal.Header>
            <HeroModal.Heading>{title}</HeroModal.Heading>
          </HeroModal.Header>
          <HeroModal.Body>{children}</HeroModal.Body>
        </HeroModal.Dialog>
      </HeroModal.Container>
    </HeroModal.Backdrop>
  );
}
export function Drawer(props: ModalProps) {
  return (
    <HeroModal.Backdrop isOpen={props.opened} onOpenChange={(open) => !open && props.onClose()} isDismissable>
      <HeroModal.Container className="fixed inset-y-0 right-0 m-0 h-dvh w-full max-w-md" scroll="inside">
        <HeroModal.Dialog
          className="h-full rounded-none"
          onClick={props.onClick}
          aria-label={typeof props.title === "string" ? props.title : "Navigation"}
        >
          <HeroModal.CloseTrigger aria-label="Close navigation" />
          <HeroModal.Header>
            <HeroModal.Heading>{props.title}</HeroModal.Heading>
          </HeroModal.Header>
          <HeroModal.Body>{props.children}</HeroModal.Body>
        </HeroModal.Dialog>
      </HeroModal.Container>
    </HeroModal.Backdrop>
  );
}
interface PopoverProps extends CommonProps {
  opened?: boolean;
  onChange?: (open: boolean) => void;
  onDismiss?: () => void;
  withArrow?: boolean;
  withOverlay?: boolean;
  overlayProps?: object;
  position?: string;
  width?: number;
  shadow?: string;
  trigger?: string;
}
export function Popover({ children, opened, onChange, onDismiss }: PopoverProps) {
  return (
    <HeroPopover
      isOpen={opened}
      onOpenChange={(open) => {
        onChange?.(open);
        if (!open) onDismiss?.();
      }}
    >
      {children}
    </HeroPopover>
  );
}
Popover.Target = function PopoverTarget({ children }: { children: ReactElement }) {
  return children;
};
Popover.Dropdown = function PopoverDropdown({ children, className }: CommonProps) {
  return (
    <HeroPopover.Content placement="bottom start">
      <HeroPopover.Dialog className={className} aria-label="Details">
        {children}
      </HeroPopover.Dialog>
    </HeroPopover.Content>
  );
};
// Popovers support rich navigation content and independently authorized items.
const MenuCloseContext = createContext<() => void>(() => undefined);
const MenuInteractionContext = createContext({
  enter: () => undefined as void,
  leave: () => undefined as void,
  width: undefined as number | undefined,
});
export function Menu({ children, opened, onChange, trigger, width }: PopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const setOpen = (open: boolean) => {
    setInternalOpen(open);
    onChange?.(open);
  };
  return (
    <MenuCloseContext.Provider value={() => setOpen(false)}>
      <MenuInteractionContext.Provider
        value={{
          width,
          enter: () => {
            if (trigger === "click-hover") {
              clearTimeout(timer.current);
              setOpen(true);
            }
          },
          leave: () => {
            if (trigger === "click-hover") timer.current = setTimeout(() => setOpen(false), 150);
          },
        }}
      >
        <HeroPopover isOpen={opened ?? internalOpen} onOpenChange={setOpen}>
          {children}
        </HeroPopover>
      </MenuInteractionContext.Provider>
    </MenuCloseContext.Provider>
  );
}
Menu.Target = function MenuTarget({ children }: { children: ReactElement }) {
  const { enter, leave } = useContext(MenuInteractionContext);
  return (
    <span className="inline-flex" onMouseEnter={enter} onMouseLeave={leave}>
      {children}
    </span>
  );
};
Menu.Dropdown = function MenuDropdown({ children, className }: CommonProps) {
  const close = useContext(MenuCloseContext);
  const focusFirstItem = React.useCallback((node: HTMLDivElement | null) => {
    node?.querySelector<HTMLElement>("button:not([disabled]), a[href]")?.focus();
  }, []);
  const { enter, leave, width } = useContext(MenuInteractionContext);
  return (
    <HeroPopover.Content placement="bottom start" onMouseEnter={enter} onMouseLeave={leave} style={{ width }}>
      <HeroPopover.Dialog aria-label="Navigation menu" className={className}>
        <div
          ref={focusFirstItem}
          role="menu"
          onClick={(event) => {
            if (event.target instanceof Element && event.target.closest("a")) close();
          }}
          onKeyDown={(event) => {
            if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
            const items = Array.from(
              event.currentTarget.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]"),
            );
            if (!items.length) return;
            event.preventDefault();
            const index = items.indexOf(document.activeElement as HTMLElement);
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? items.length - 1
                  : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
            items[next].focus();
          }}
        >
          {children}
        </div>
      </HeroPopover.Dialog>
    </HeroPopover.Content>
  );
};
Menu.Item = function MenuItem({
  children,
  onClick,
  rightSection,
  renderRoot,
  closeMenuOnClick = true,
  ...props
}: CommonProps & {
  onClick?: () => void;
  rightSection?: ReactNode;
  renderRoot?: (props: React.HTMLAttributes<HTMLElement>) => ReactNode;
  closeMenuOnClick?: boolean;
  role?: string;
  "aria-checked"?: boolean;
}) {
  const close = useContext(MenuCloseContext);
  const itemProps = {
    ...props,
    role: props.role ?? "menuitem",
    className: clsx(
      "flex w-full items-center justify-between gap-2 rounded p-2 text-left text-sm hover:bg-default",
      props.className,
    ),
    onClick: () => {
      onClick?.();
      if (closeMenuOnClick) close();
    },
    children: (
      <>
        {children}
        {rightSection}
      </>
    ),
  };
  return renderRoot ? (
    renderRoot(itemProps)
  ) : (
    <Button component="button" type="button" {...itemProps} variant="subtle" />
  );
};
Menu.Label = function MenuLabel({ children }: CommonProps) {
  return <div className="text-muted px-2 py-1 text-xs">{children}</div>;
};
Menu.Divider = function MenuDivider() {
  return <hr className="border-separator my-1" />;
};
export function Tooltip({
  children,
  label,
  disabled,
  withArrow,
  multiline,
  w,
  openDelay,
}: CommonProps & {
  label: ReactNode;
  disabled?: boolean;
  position?: string;
  withArrow?: boolean;
  multiline?: boolean;
  openDelay?: number;
}) {
  if (disabled) return <>{children}</>;
  return (
    <HeroTooltip delay={openDelay ?? 200}>
      <HeroTooltip.Trigger className="inline-flex" tabIndex={0}>
        {children}
      </HeroTooltip.Trigger>
      <HeroTooltip.Content showArrow={withArrow} style={{ maxWidth: w }} className={multiline ? "max-w-sm" : undefined}>
        {label}
      </HeroTooltip.Content>
    </HeroTooltip>
  );
}
export function Tabs({
  children,
  value,
  defaultValue,
  onChange,
  className,
}: CommonProps & {
  value?: string | null;
  defaultValue?: string;
  onChange?: (value: string | null) => void;
  keepMounted?: boolean;
}) {
  return (
    <HeroTabs
      selectedKey={value ?? undefined}
      defaultSelectedKey={defaultValue}
      onSelectionChange={(key) => onChange?.(String(key))}
      className={className}
    >
      {children}
    </HeroTabs>
  );
}
Tabs.List = function TabsList({ children, className }: CommonProps & { grow?: boolean }) {
  return (
    <HeroTabs.List aria-label="Sections" className={clsx("flex-wrap", className)}>
      {children}
    </HeroTabs.List>
  );
};
Tabs.Tab = function TabsTab({
  children,
  value,
  leftSection,
  rightSection,
}: CommonProps & { value: string; leftSection?: ReactNode; rightSection?: ReactNode }) {
  return (
    <HeroTabs.Tab id={value}>
      {leftSection}
      {children}
      {rightSection}
      <HeroTabs.Indicator />
    </HeroTabs.Tab>
  );
};
Tabs.Panel = function TabsPanel({ children, value, className, ...props }: CommonProps & { value: string }) {
  return (
    <HeroTabs.Panel id={value} className={className} style={props.style}>
      {children}
    </HeroTabs.Panel>
  );
};
export function Accordion({ children, defaultValue }: CommonProps & { defaultValue?: string | null }) {
  return <HeroAccordion defaultExpandedKeys={defaultValue ? [defaultValue] : []}>{children}</HeroAccordion>;
}
Accordion.Item = function AccordionItem({ children, value }: CommonProps & { value: string }) {
  return <HeroAccordion.Item id={value}>{children}</HeroAccordion.Item>;
};
Accordion.Control = function AccordionControl({ children }: CommonProps) {
  return (
    <HeroAccordion.Heading>
      <HeroAccordion.Trigger>
        {children}
        <HeroAccordion.Indicator />
      </HeroAccordion.Trigger>
    </HeroAccordion.Heading>
  );
};
Accordion.Panel = function AccordionPanel({ children, className }: CommonProps) {
  return (
    <HeroAccordion.Panel>
      <HeroAccordion.Body className={className}>{children}</HeroAccordion.Body>
    </HeroAccordion.Panel>
  );
};

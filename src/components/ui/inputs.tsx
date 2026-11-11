import { CommonProps } from "./primitives";
import {
  Checkbox as HeroCheckbox,
  CheckboxGroup,
  ComboBox,
  Description,
  FieldError,
  Input,
  Label,
  ListBox,
  Radio as HeroRadio,
  RadioGroup,
  Select as HeroSelect,
  Slider as HeroSlider,
  TextArea,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import clsx from "clsx";
import React, { ChangeEventHandler, ReactNode, useState } from "react";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "color"> {
  size?: string | number;
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
}
export function TextInput({
  label,
  description,
  error,
  leftSection,
  rightSection,
  className,
  disabled,
  required,
  size,
  id,
  "aria-label": ariaLabel,
  ...props
}: InputProps) {
  return (
    <TextField
      id={id}
      aria-label={label ? undefined : ariaLabel}
      className={clsx("w-full", className)}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={!!error}
    >
      {label && (
        <Label>
          {label}
          {required && (
            <span aria-hidden="true" className="text-danger ml-0.5">
              *
            </span>
          )}
        </Label>
      )}
      <div className="relative flex items-center gap-1">
        {leftSection}
        <Input {...props} className={clsx("w-full", size === "xs" && "h-7 text-xs")} />
        {rightSection}
      </div>
      {description && <Description>{description}</Description>}
      {error && <FieldError>{error}</FieldError>}
    </TextField>
  );
}
export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "color"> {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  autosize?: boolean;
  minRows?: number;
  maxRows?: number;
  resize?: React.CSSProperties["resize"];
}
export function Textarea({
  label,
  description,
  error,
  disabled,
  required,
  autosize,
  minRows,
  maxRows,
  resize,
  className,
  id,
  "aria-label": ariaLabel,
  ...props
}: TextareaProps) {
  return (
    <TextField
      id={id}
      aria-label={label ? undefined : ariaLabel}
      className={clsx("w-full", className)}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={!!error}
    >
      {label && (
        <Label>
          {label}
          {required && (
            <span aria-hidden="true" className="text-danger ml-0.5">
              *
            </span>
          )}
        </Label>
      )}
      <TextArea
        {...props}
        rows={minRows ?? props.rows}
        style={{
          resize,
          fieldSizing: autosize ? "content" : undefined,
          maxHeight: maxRows ? `${maxRows * 1.5 + 1}rem` : undefined,
          ...props.style,
        }}
      />
      {description && <Description>{description}</Description>}
      {error && <FieldError>{error}</FieldError>}
    </TextField>
  );
}
export function NumberInput({
  onChange,
  value,
  allowDecimal,
  allowNegative,
  ...props
}: Omit<InputProps, "onChange" | "value"> & {
  value?: string | number;
  onChange?: (value: number | string) => void;
  allowDecimal?: boolean;
  allowNegative?: boolean;
}) {
  return (
    <TextInput
      {...props}
      type="number"
      value={value}
      step={allowDecimal === false ? 1 : props.step}
      min={allowNegative === false ? 0 : props.min}
      onChange={(event) => onChange?.(event.target.value === "" ? "" : Number(event.target.value))}
    />
  );
}
export interface ComboboxItem {
  value: string;
  label: string;
  disabled?: boolean;
}
export type OptionsFilter = (input: { options: ComboboxItem[]; search: string; limit: number }) => ComboboxItem[];
export interface SelectProps<T extends string = string> extends Omit<
  InputProps,
  "onChange" | "value" | "defaultValue" | "data" | "onSelect" | "onBlur"
> {
  data?: (
    | T
    | (Omit<ComboboxItem, "value"> & { value: T })
    | { group: string; items: (T | (Omit<ComboboxItem, "value"> & { value: T }))[] }
  )[];
  value?: T | null;
  defaultValue?: T;
  onBlur?: React.FocusEventHandler<Element>;
  onChange?: (value: T | null, option: ComboboxItem) => void;
  searchable?: boolean;
  clearable?: boolean;
  allowDeselect?: boolean;
  limit?: number;
  filter?: OptionsFilter;
  nothingFoundMessage?: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  comboboxProps?: { withinPortal?: boolean };
}
export function Select<T extends string>({
  data = [],
  label,
  description,
  error,
  value,
  defaultValue,
  onChange,
  searchable,
  clearable,
  limit = Infinity,
  filter,
  disabled,
  required,
  placeholder,
  className,
  onBlur,
  name,
  id,
  searchValue,
  onSearchChange,
  "aria-label": ariaLabel,
  nothingFoundMessage,
  size,
}: SelectProps<T>) {
  const { t } = useLingui();
  const options = data.flatMap((entry) =>
    typeof entry === "string"
      ? [{ value: entry, label: entry }]
      : "group" in entry
        ? entry.items.map((item) => (typeof item === "string" ? { value: item, label: item } : item))
        : [entry],
  );
  const [search, setSearch] = useState("");
  const change = (key: React.Key | null) => {
    const option = options.find((item) => item.value === key);
    onChange?.(key === null ? null : (String(key) as T), option ?? { value: "", label: "" });
  };
  const shared = {
    className: clsx("w-full", size === "xs" && "text-xs", className),
    value,
    defaultValue,
    onChange: change,
    isDisabled: disabled,
    isRequired: required,
    isInvalid: !!error,
    name,
    id,
    onBlur,
    "aria-label": label ? undefined : (ariaLabel ?? placeholder ?? name ?? t`Select`),
  };
  const footer = (
    <>
      {description && <Description>{description}</Description>}
      {error && <FieldError>{error}</FieldError>}
    </>
  );
  if (searchable) {
    const query = searchValue ?? search;
    const items = filter
      ? filter({ options, search: query, limit })
      : options.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())).slice(0, limit);
    return (
      <ComboBox
        {...shared}
        allowsEmptyCollection
        onInputChange={(text) => {
          setSearch(text);
          onSearchChange?.(text);
        }}
      >
        {label && (
          <Label>
            {label}
            {required && (
              <span aria-hidden="true" className="text-danger ml-0.5">
                *
              </span>
            )}
          </Label>
        )}
        <ComboBox.InputGroup>
          <Input placeholder={placeholder} />
          <ComboBox.Trigger />
        </ComboBox.InputGroup>
        <ComboBox.Popover>
          <ListBox
            items={items}
            renderEmptyState={() => (
              <span className="text-muted p-2 text-sm">{nothingFoundMessage ?? t`No results`}</span>
            )}
          >
            {(item) => (
              <ListBox.Item id={item.value} textValue={item.label} isDisabled={item.disabled}>
                {item.label}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            )}
          </ListBox>
        </ComboBox.Popover>
        {clearable && value && (
          <button
            type="button"
            className="text-muted text-xs"
            aria-label={t`Clear selection`}
            onClick={() => change(null)}
          >
            {t`Clear`}
          </button>
        )}
        {footer}
      </ComboBox>
    );
  }
  return (
    <HeroSelect {...shared} placeholder={placeholder}>
      {label && (
        <Label>
          {label}
          {required && (
            <span aria-hidden="true" className="text-danger ml-0.5">
              *
            </span>
          )}
        </Label>
      )}
      <HeroSelect.Trigger>
        <HeroSelect.Value />
        <HeroSelect.Indicator />
        {clearable && <HeroSelect.ClearButton />}
      </HeroSelect.Trigger>
      <HeroSelect.Popover>
        <ListBox items={options}>
          {(item) => (
            <ListBox.Item id={item.value} textValue={item.label} isDisabled={item.disabled}>
              {item.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          )}
        </ListBox>
      </HeroSelect.Popover>
      {footer}
    </HeroSelect>
  );
}
export function Checkbox({
  label,
  description,
  checked,
  defaultChecked,
  onChange,
  disabled,
  indeterminate,
  className,
  color,
  name,
  value,
  onBlur,
  "aria-label": ariaLabel,
}: Omit<InputProps, "onChange"> & {
  color?: string;
  indeterminate?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <HeroCheckbox
      style={{ "--accent": color ? `var(--color-${color}-600, var(--accent))` : undefined } as React.CSSProperties}
      className={className}
      isSelected={checked}
      defaultSelected={defaultChecked}
      isDisabled={disabled}
      isIndeterminate={indeterminate}
      name={name}
      value={typeof value === "string" ? value : undefined}
      onBlur={onBlur as React.FocusEventHandler<Element>}
      aria-label={ariaLabel}
      onChange={(selected) =>
        onChange?.({
          target: { checked: selected },
          currentTarget: { checked: selected },
        } as React.ChangeEvent<HTMLInputElement>)
      }
    >
      <HeroCheckbox.Content aria-label={label ? undefined : ariaLabel}>
        <HeroCheckbox.Control>
          <HeroCheckbox.Indicator />
        </HeroCheckbox.Control>
        {label && <Label>{label}</Label>}
      </HeroCheckbox.Content>
      {description && <Description>{description}</Description>}
    </HeroCheckbox>
  );
}
Checkbox.Group = function CheckboxOptions<T extends string>({
  children,
  value,
  onChange,
}: {
  children?: ReactNode;
  value?: T[];
  onChange?: (value: T[]) => void;
}) {
  return (
    <CheckboxGroup value={value} onChange={(values) => onChange?.(values as T[])}>
      {children}
    </CheckboxGroup>
  );
};
export const Radio = Object.assign(
  ({ label, value }: { label?: ReactNode; value: string }) => (
    <HeroRadio value={value}>
      <HeroRadio.Content>
        <HeroRadio.Control>
          <HeroRadio.Indicator />
        </HeroRadio.Control>
        <Label>{label}</Label>
      </HeroRadio.Content>
    </HeroRadio>
  ),
  {
    Group: ({
      label,
      children,
      value,
      onChange,
    }: {
      label?: ReactNode;
      children?: ReactNode;
      value?: string;
      onChange?: (value: string) => void;
    }) => (
      <RadioGroup value={value} onChange={onChange}>
        {label && <Label>{label}</Label>}
        {children}
      </RadioGroup>
    ),
  },
);
export function SegmentedControl<T extends string>({
  data,
  value,
  onChange,
  className,
}: CommonProps & { data: (T | { label: ReactNode; value: T })[]; value?: T; onChange?: (value: T) => void }) {
  return (
    <ToggleButtonGroup
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={value ? [value] : []}
      onSelectionChange={(keys) => {
        const key = [...keys][0];
        if (key !== undefined) onChange?.(String(key) as T);
      }}
      className={clsx("app-segments", className)}
      aria-label="Display options"
    >
      {data.map((entry) => {
        const item = typeof entry === "string" ? { value: entry, label: entry } : entry;
        return (
          <ToggleButton key={item.value} id={item.value} size="sm">
            {item.label}
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
}
export function Slider({
  value,
  onChange,
  min,
  max,
  step,
  marks,
  label,
  disabled,
  thumbLabel,
}: CommonProps & {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  marks?: { value: number; label?: ReactNode }[];
  label?: ReactNode | ((value: number) => ReactNode);
  disabled?: boolean;
  thumbLabel?: string;
}) {
  return (
    <HeroSlider
      value={value}
      onChange={(v) => onChange?.(Array.isArray(v) ? v[0] : v)}
      minValue={min}
      maxValue={max}
      step={step}
      isDisabled={disabled}
      aria-label={thumbLabel ?? "Value"}
    >
      <HeroSlider.Output>
        {({ state }) => (typeof label === "function" ? label(state.values[0]) : label)}
      </HeroSlider.Output>
      <HeroSlider.Track>
        <HeroSlider.Fill />
        <HeroSlider.Thumb />
      </HeroSlider.Track>
      {marks && (
        <HeroSlider.Marks>
          {marks.map((mark) => (
            <HeroSlider.Mark key={mark.value} value={mark.value}>
              {mark.label}
            </HeroSlider.Mark>
          ))}
        </HeroSlider.Marks>
      )}
    </HeroSlider>
  );
}
export const FileInput = ({
  onChange,
  accept,
  label,
  disabled,
}: Omit<InputProps, "onChange"> & { onChange?: (file: File | null) => void; accept?: string }) => (
  <TextInput
    type="file"
    label={label}
    accept={accept}
    disabled={disabled}
    onChange={(e) => onChange?.(e.target.files?.[0] ?? null)}
  />
);

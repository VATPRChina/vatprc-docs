import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { $api } from "@/lib/client";
import { Trans, useLingui } from "@lingui/react/macro";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState, type ComponentProps } from "react";

type UserOption = { id: string; full_name: string; cid: string };
type UserInputProps = Omit<ComponentProps<typeof Button>, "value" | "onChange"> & {
  value?: string | null;
  onChange?: (value: string | null) => void;
};

function UserSelect({
  users,
  isLoading,
  loadError,
  value,
  onChange,
  ...props
}: UserInputProps & { users?: UserOption[]; isLoading: boolean; loadError?: string }) {
  const [open, setOpen] = useState(false);
  const { t } = useLingui();
  const selected = users?.find((user) => user.id === value);
  if (isLoading) return <Skeleton className="h-10 w-full" />;
  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button variant="neutral" className="w-full justify-between" {...props} />}>
          <span>{selected ? `${selected.full_name} (${selected.cid})` : t`Select user`}</span>
          <ChevronsUpDown />
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <Command
            filter={(value, search) => {
              const tokens = search.toLowerCase().split(/\s+/).filter(Boolean);
              const label = value.toLowerCase();
              return label.replace(/\s+/g, "").includes(tokens.join("")) ||
                tokens.every((token) => label.includes(token))
                ? 1
                : 0;
            }}
          >
            <CommandInput placeholder={t`Search users`} aria-label={t`Search users`} />
            <CommandList>
              <CommandEmpty>
                <Trans>No users found</Trans>
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="__clear__"
                  onSelect={() => {
                    onChange?.(null);
                    setOpen(false);
                  }}
                >
                  <Trans>Clear selection</Trans>
                </CommandItem>
                {users?.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={`${user.full_name} (${user.cid})`}
                    onSelect={() => {
                      onChange?.(user.id);
                      setOpen(false);
                    }}
                  >
                    {user.full_name} ({user.cid}){user.id === value && <Check className="ml-auto" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {loadError && (
        <p role="alert" className="text-sm text-red-600">
          {loadError}
        </p>
      )}
    </div>
  );
}

export function UserInput(props: UserInputProps) {
  const { data: users, error, isLoading } = $api.useQuery("get", "/api/users");
  return <UserSelect users={users} isLoading={isLoading} loadError={error?.detail ?? error?.title} {...props} />;
}
export function ControllerInput(props: UserInputProps) {
  const { data, error, isLoading } = $api.useQuery("get", "/api/atc/controllers");
  return (
    <UserSelect
      users={data?.map((controller) => controller.user)}
      isLoading={isLoading}
      loadError={error?.detail ?? error?.title}
      {...props}
    />
  );
}

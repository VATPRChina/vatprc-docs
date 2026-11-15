import { $api } from "@/lib/client";
import { ComboboxItem, OptionsFilter, Select, SelectProps, Skeleton } from "@mantine/core";
import { FC, useMemo } from "react";

type UserOption = {
  id: string;
  full_name: string;
  cid: string;
};

// Match ignoring case and spaces ("zhanlong" -> "Zhan Long Bei"), or by every space-separated token in any order.
const fuzzyFilter: OptionsFilter = ({ options, search, limit }) => {
  const tokens = search.toLowerCase().split(/\s+/).filter(Boolean);
  const joined = tokens.join("");
  return (options as ComboboxItem[])
    .filter((option) => {
      const label = option.label.toLowerCase();
      return label.replace(/\s+/g, "").includes(joined) || tokens.every((token) => label.includes(token));
    })
    .slice(0, limit);
};

const UserSelect: FC<SelectProps & { users?: UserOption[]; isLoading: boolean; loadError?: string }> = ({
  users,
  isLoading,
  loadError,
  ...props
}) => {
  const selectOptions = useMemo(
    () =>
      users?.map(
        (user) =>
          ({
            value: user.id,
            label: `${user.full_name} (${user.cid})`,
          }) satisfies ComboboxItem,
      ),
    [users],
  );

  return (
    <Skeleton visible={isLoading}>
      <Select
        data={selectOptions}
        limit={5}
        searchable
        filter={fuzzyFilter}
        {...props}
        error={props.error ?? loadError}
      />
    </Skeleton>
  );
};

export const UserInput: FC<SelectProps> = (props) => {
  const { data: users, error, isLoading } = $api.useQuery("get", "/api/users");

  return <UserSelect users={users} isLoading={isLoading} loadError={error?.detail ?? error?.title} {...props} />;
};

export const ControllerInput: FC<SelectProps> = (props) => {
  const { data: controllers, error, isLoading } = $api.useQuery("get", "/api/atc/controllers");

  return (
    <UserSelect
      users={controllers?.map((controller) => controller.user)}
      isLoading={isLoading}
      loadError={error?.detail ?? error?.title}
      {...props}
    />
  );
};

import { $api } from "@/lib/client";
import { ComboboxItem, Select, SelectProps, Skeleton } from "@mantine/core";
import { FC, useMemo } from "react";

type UserOption = {
  id: string;
  full_name: string;
  cid: string;
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
      <Select data={selectOptions} limit={5} searchable {...props} error={props.error ?? loadError} />
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

import { $api } from "@/lib/client";
import { ComboboxItem, Select, SelectProps, Skeleton } from "@mantine/core";
import { FC, useMemo } from "react";

export const UserInput: FC<SelectProps> = ({ ...props }) => {
  const { data: users, isLoading } = $api.useQuery("get", "/api/users");

  const selectOptions = useMemo(
    () =>
      users?.map(
        (u) =>
          ({
            value: u.id,
            label: `${u.full_name} (${u.cid})`,
          }) satisfies ComboboxItem,
      ),
    [users],
  );

  return (
    <Skeleton visible={isLoading}>
      <Select data={selectOptions} limit={5} searchable {...props} />
    </Skeleton>
  );
};

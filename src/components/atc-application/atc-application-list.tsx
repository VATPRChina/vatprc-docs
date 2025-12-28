import { RichTable } from "../table";
import { APPLICATION_STATUS } from "./atc-application-status";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { localizeWithMap } from "@/lib/i18n";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { Button } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { FC } from "react";
import { TbFileDescription } from "react-icons/tb";

const columnHelper = createColumnHelper<components["schemas"]["AtcApplicationSummaryDto"]>();

export const columns = [
  columnHelper.accessor("user.cid", { header: () => <Trans>CID</Trans> }),
  columnHelper.accessor("user.full_name", { header: () => <Trans>Name</Trans> }),
  columnHelper.accessor("status", {
    header: () => <Trans>Status</Trans>,
    cell: ({ getValue }) => {
      const { i18n } = useLingui();
      return localizeWithMap(APPLICATION_STATUS, getValue(), i18n);
    },
  }),
  columnHelper.accessor("applied_at", {
    header: () => <Trans>Applied At</Trans>,
    cell: ({ getValue }) => format(getValue(), "yyyy-MM-dd HH:mm'Z'", { in: utc }),
  }),
  columnHelper.display({
    id: "actions",
    header: () => <Trans>Actions</Trans>,
    cell: ({ row }) => (
      <Button
        variant="subtle"
        leftSection={<TbFileDescription />}
        renderRoot={(props) => <Link to="/controllers/applications/$id/" params={{ id: row.original.id }} {...props} />}
      >
        <Trans>View</Trans>
      </Button>
    ),
  }),
];

export const AtcApplicationList: FC = () => {
  const { data, isLoading } = $api.useQuery("get", "/api/atc/applications");

  return <RichTable data={data} columns={columns} isLoading={isLoading} />;
};

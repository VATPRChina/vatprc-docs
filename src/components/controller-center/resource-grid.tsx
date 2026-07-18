import { cn } from "@/lib/utils";
import { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { UnstyledButton } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { FC } from "react";
import { IconType } from "react-icons";
import {
  TbBook2,
  TbClipboardList,
  TbExternalLink,
  TbFileText,
  TbListDetails,
  TbMap2,
  TbRadar2,
  TbSchool,
  TbUsers,
  TbWorld,
} from "react-icons/tb";

interface ResourceItem {
  label: MessageDescriptor;
  href: string;
  icon: IconType;
  external?: boolean;
  isPublic?: boolean;
}

const TRAINING_RESOURCES: ResourceItem[] = [
  { label: msg`Moodle`, href: "https://moodle.vatprc.net", icon: TbSchool, external: true },
  { label: msg`Progression Guide`, href: "/controller/controller-regulations", icon: TbBook2, isPublic: true },
  { label: msg`Visiting & Transfer`, href: "/controller/visiting-and-transferring", icon: TbWorld, isPublic: true },
];

const CONTROLLING_RESOURCES: ResourceItem[] = [
  { label: msg`Sector Files`, href: "/controller/sector", icon: TbMap2 },
  { label: msg`Controller List`, href: "/controller/controller-list", icon: TbUsers, isPublic: true },
  { label: msg`Station & Frequency`, href: "/airspace/station", icon: TbRadar2, isPublic: true },
  { label: msg`Restricted Airspace`, href: "/airspace/restricted", icon: TbListDetails, isPublic: true },
  { label: msg`Standard Operation Procedures`, href: "/airspace/sop", icon: TbClipboardList, isPublic: true },
  { label: msg`Letter of Agreement`, href: "/controller/loa", icon: TbFileText, isPublic: true },
];

const ResourceCard: FC<{ item: ResourceItem }> = ({ item }) => {
  const { i18n } = useLingui();
  const Icon = item.icon;
  const body = (
    <>
      <Icon size={20} className="shrink-0 text-red-700 dark:text-red-400" />
      <span className="flex items-center gap-1 font-medium">
        {i18n._(item.label)}
        {item.external && <TbExternalLink size={14} className="text-gray-500 dark:text-gray-400" />}
      </span>
    </>
  );
  const className =
    "flex items-center gap-3 border border-gray-200 px-4 py-3 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900";

  return item.external ? (
    <UnstyledButton component="a" href={item.href} target="_blank" rel="noreferrer" className={className}>
      {body}
    </UnstyledButton>
  ) : (
    <UnstyledButton component={Link} to={item.href} className={className}>
      {body}
    </UnstyledButton>
  );
};

const filterItems = (items: ResourceItem[], publicOnly: boolean) =>
  publicOnly ? items.filter((item) => item.isPublic) : items;

export const ResourceGrid: FC<{ publicOnly?: boolean; compact?: boolean }> = ({
  publicOnly = false,
  compact = false,
}) => {
  const groups = [
    {
      key: "training",
      title: <Trans context="resource group">Training</Trans>,
      items: filterItems(TRAINING_RESOURCES, publicOnly),
    },
    {
      key: "controlling",
      title: <Trans context="resource group">Controlling</Trans>,
      items: filterItems(CONTROLLING_RESOURCES, publicOnly),
    },
  ].filter((group) => group.items.length > 0);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-medium">
        <Trans>Resources</Trans>
      </h2>
      {groups.map((group) => (
        <div key={group.key} className="flex flex-col gap-2">
          <h3 className="text-sm font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
            {group.title}
          </h3>
          <div className={cn("grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3", compact && "xl:grid-cols-1")}>
            {group.items.map((item) => (
              <ResourceCard key={item.href} item={item} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

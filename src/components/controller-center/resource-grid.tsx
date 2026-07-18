import { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";
import { FC } from "react";
import { IconType } from "react-icons";
import { TbBook2, TbExternalLink, TbListDetails, TbMap2, TbRadar2, TbSchool, TbUsers, TbWorld } from "react-icons/tb";

interface ResourceItem {
  label: MessageDescriptor;
  description: MessageDescriptor;
  href: string;
  icon: IconType;
  external?: boolean;
  isPublic?: boolean;
}

const TRAINING_RESOURCES: ResourceItem[] = [
  {
    label: msg`Moodle`,
    description: msg`Online training courses`,
    href: "https://moodle.vatprc.net",
    icon: TbSchool,
    external: true,
  },
  {
    label: msg`Progression Guide`,
    description: msg`Controller rating progression`,
    href: "/controller/controller-regulations",
    icon: TbBook2,
    isPublic: true,
  },
  {
    label: msg`Visiting & Transfer`,
    description: msg`Join us from another division`,
    href: "/controller/visiting-and-transferring",
    icon: TbWorld,
    isPublic: true,
  },
];

const CONTROLLING_RESOURCES: ResourceItem[] = [
  { label: msg`Sector Files`, description: msg`Sector files and plugins`, href: "/controller/sector", icon: TbMap2 },
  {
    label: msg`Controller List`,
    description: msg`Roster and permissions`,
    href: "/controller/controller-list",
    icon: TbUsers,
    isPublic: true,
  },
  {
    label: msg`Station & Frequency`,
    description: msg`Position and frequency list`,
    href: "/airspace/station",
    icon: TbRadar2,
    isPublic: true,
  },
  {
    label: msg`Restricted Airspace`,
    description: msg`Restricted airspace list`,
    href: "/airspace/restricted",
    icon: TbListDetails,
    isPublic: true,
  },
];

const ResourceCard: FC<{ item: ResourceItem }> = ({ item }) => {
  const { i18n } = useLingui();
  const Icon = item.icon;
  const body = (
    <>
      <Icon size={22} className="shrink-0 text-red-700 dark:text-red-400" />
      <span className="flex flex-col">
        <span className="flex items-center gap-1 font-medium">
          {i18n._(item.label)}
          {item.external && <TbExternalLink size={14} className="text-gray-500 dark:text-gray-400" />}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{i18n._(item.description)}</span>
      </span>
    </>
  );
  const className =
    "flex items-center gap-3 border border-gray-200 px-4 py-3 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900";

  return item.external ? (
    <a href={item.href} target="_blank" rel="noreferrer" className={className}>
      {body}
    </a>
  ) : (
    <Link to={item.href} className={className}>
      {body}
    </Link>
  );
};

const filterItems = (items: ResourceItem[], publicOnly: boolean) =>
  publicOnly ? items.filter((item) => item.isPublic) : items;

export const ResourceGrid: FC<{ publicOnly?: boolean }> = ({ publicOnly = false }) => {
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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => (
              <ResourceCard key={item.href} item={item} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

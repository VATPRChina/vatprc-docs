import { Label } from "./ui/label";
import { Spinner } from "./ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Trans } from "@lingui/react/macro";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";

enum ControllerRating {
  Unknown = 0,
  S1 = 1,
  S2 = 3,
  S3 = 4,
  C1 = 5,
  C3 = 6,
  I1 = 7,
  I3 = 8,
}
enum ControllerRatingType {
  Unknown = 0,
  Student = 1,
  Controller = 2,
}

enum ControllerPosition {
  DEL = 0,
  GND = 1,
  TWR = 2,
  PTWR = 3, // Procedural TWR
  APP = 4,
  CTR = 5,
  FSS = 6,
  TMU = 7,
}

enum ControllerPositionPermission {
  Restricted = 0,
  Training = 1,
  Solo = 2,
  Full = 3,
}

enum ControllerStatus {
  Active = 0,
  Absence = 1,
}

enum RoleType {
  Rating,
  Position,
  Status,
  Marker,
}

interface RatingRoleItem {
  type: RoleType.Rating;
  value: ControllerRating;
  extraValue: ControllerRatingType;
}
interface StatusRoleItem {
  type: RoleType.Status;
  value: ControllerStatus;
}
interface PositionRoleItem {
  type: RoleType.Position;
  value: ControllerPosition;
  extraValue: ControllerPositionPermission;
}
interface MarkerItem {
  type: RoleType.Marker;
}
type RoleItem = RatingRoleItem | StatusRoleItem | PositionRoleItem | MarkerItem;

const VISITING_CONTROLLER_ID = 298;

const ROLE_MAP: Record<string, RoleItem> = {
  // S1 Student
  201: {
    type: RoleType.Rating,
    value: ControllerRating.S1,
    extraValue: ControllerRatingType.Student,
  },
  // S1 Controller
  202: {
    type: RoleType.Rating,
    value: ControllerRating.S1,
    extraValue: ControllerRatingType.Controller,
  },
  // S2 Student
  203: {
    type: RoleType.Rating,
    value: ControllerRating.S2,
    extraValue: ControllerRatingType.Student,
  },
  // S2 Controller
  204: {
    type: RoleType.Rating,
    value: ControllerRating.S2,
    extraValue: ControllerRatingType.Controller,
  },
  // S3 Student
  205: {
    type: RoleType.Rating,
    value: ControllerRating.S3,
    extraValue: ControllerRatingType.Student,
  },
  // S3 Controller
  206: {
    type: RoleType.Rating,
    value: ControllerRating.S3,
    extraValue: ControllerRatingType.Controller,
  },
  // C1 Student
  207: {
    type: RoleType.Rating,
    value: ControllerRating.C1,
    extraValue: ControllerRatingType.Student,
  },
  // C1 Controller
  208: {
    type: RoleType.Rating,
    value: ControllerRating.C1,
    extraValue: ControllerRatingType.Controller,
  },
  // C3 Student
  211: {
    type: RoleType.Rating,
    value: ControllerRating.C3,
    extraValue: ControllerRatingType.Student,
  },
  // C3 Controller
  212: {
    type: RoleType.Rating,
    value: ControllerRating.C3,
    extraValue: ControllerRatingType.Controller,
  },
  // I1 Instructor
  213: {
    type: RoleType.Rating,
    value: ControllerRating.I1,
    extraValue: ControllerRatingType.Controller,
  },
  // I3 Instructor
  215: {
    type: RoleType.Rating,
    value: ControllerRating.I3,
    extraValue: ControllerRatingType.Controller,
  },
  // Absence
  297: {
    type: RoleType.Status,
    value: ControllerStatus.Absence,
  },
  // Visiting Controller
  298: {
    type: RoleType.Marker,
  },
  // ATC Student
  299: {
    type: RoleType.Marker,
  },
  // DEL Full Permission
  300: {
    type: RoleType.Position,
    value: ControllerPosition.DEL,
    extraValue: ControllerPositionPermission.Full,
  },
  // DEL Solo Permission
  301: {
    type: RoleType.Position,
    value: ControllerPosition.DEL,
    extraValue: ControllerPositionPermission.Solo,
  },
  // DEL Under Mentoring Permission
  302: {
    type: RoleType.Position,
    value: ControllerPosition.DEL,
    extraValue: ControllerPositionPermission.Training,
  },
  // GND Full Permission
  310: {
    type: RoleType.Position,
    value: ControllerPosition.GND,
    extraValue: ControllerPositionPermission.Full,
  },
  // GND Solo Permission
  311: {
    type: RoleType.Position,
    value: ControllerPosition.GND,
    extraValue: ControllerPositionPermission.Solo,
  },
  // GND Under Mentoring Permission
  312: {
    type: RoleType.Position,
    value: ControllerPosition.GND,
    extraValue: ControllerPositionPermission.Training,
  },
  // TWR Full Permission
  320: {
    type: RoleType.Position,
    value: ControllerPosition.TWR,
    extraValue: ControllerPositionPermission.Full,
  },
  // TWR Solo Permission
  321: {
    type: RoleType.Position,
    value: ControllerPosition.TWR,
    extraValue: ControllerPositionPermission.Solo,
  },
  // TWR Under Mentoring Permission
  322: {
    type: RoleType.Position,
    value: ControllerPosition.TWR,
    extraValue: ControllerPositionPermission.Training,
  },
  // APP Full Permission
  330: {
    type: RoleType.Position,
    value: ControllerPosition.APP,
    extraValue: ControllerPositionPermission.Full,
  },
  // APP Solo Permission
  331: {
    type: RoleType.Position,
    value: ControllerPosition.APP,
    extraValue: ControllerPositionPermission.Solo,
  },
  // APP Under Mentoring Permission
  332: {
    type: RoleType.Position,
    value: ControllerPosition.APP,
    extraValue: ControllerPositionPermission.Training,
  },
  // Procedural TWR Permission
  333: {
    type: RoleType.Position,
    value: ControllerPosition.PTWR,
    extraValue: ControllerPositionPermission.Full,
  },
  // CTR Full Permission
  340: {
    type: RoleType.Position,
    value: ControllerPosition.CTR,
    extraValue: ControllerPositionPermission.Full,
  },
  // CTR Solo Permission
  341: {
    type: RoleType.Position,
    value: ControllerPosition.CTR,
    extraValue: ControllerPositionPermission.Solo,
  },
  // CTR Under Mentoring Permission
  342: {
    type: RoleType.Position,
    value: ControllerPosition.CTR,
    extraValue: ControllerPositionPermission.Training,
  },
  // FSS Full Permission
  350: {
    type: RoleType.Position,
    value: ControllerPosition.FSS,
    extraValue: ControllerPositionPermission.Full,
  },
  // FSS Solo Permission
  351: {
    type: RoleType.Position,
    value: ControllerPosition.FSS,
    extraValue: ControllerPositionPermission.Solo,
  },
  // FSS Under Mentoring Permission
  352: {
    type: RoleType.Position,
    value: ControllerPosition.FSS,
    extraValue: ControllerPositionPermission.Training,
  },
  // Traffic Management Center Permission
  360: {
    type: RoleType.Position,
    value: ControllerPosition.TMU,
    extraValue: ControllerPositionPermission.Full,
  },
  // Online Permission
  399: {
    type: RoleType.Marker,
  },
};

interface ControllerListResponseItem {
  id: number;
  first_name: string;
  last_name: string;
  roles: {
    id: number;
    name: string;
    expires: string | null;
  }[];
}

interface PermissionTagProps {
  permission: ControllerPositionPermission;
  positionName: string;
  expiration?: Date | null;
}
const PermissionTag = ({ permission, positionName, expiration }: PermissionTagProps) => {
  return (
    permission !== ControllerPositionPermission.Restricted && (
      <span
        className={cn(
          "flex items-end gap-1 px-2 py-1",
          permission === ControllerPositionPermission.Full &&
            "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
          permission === ControllerPositionPermission.Training &&
            "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
          permission === ControllerPositionPermission.Solo &&
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
        )}
      >
        {positionName}
        {permission === ControllerPositionPermission.Training && <span className="text-xs">(T)</span>}
        {permission === ControllerPositionPermission.Solo && <span className="text-xs">(S)</span>}
        {expiration && (
          <span className="text-xs">
            <Trans>until</Trans> {format(expiration, "yyyy-MM-dd")}
          </span>
        )}
      </span>
    )
  );
};

export const ControllerList: React.FC = () => {
  const [showAbsent, setShowAbsent] = useState(false);

  const { data, isLoading } = useQuery<ControllerListResponseItem[]>({
    queryKey: ["https://atcapi.vatprc.net/v1/public/controllers"],
    queryFn: () => fetch("https://atcapi.vatprc.net/v1/public/controllers").then((res) => res.json()),
  });

  const controllers = data?.map((item) => {
    let rating: ControllerRating = ControllerRating.Unknown;
    let ratingType: ControllerRatingType = ControllerRatingType.Unknown;
    let status: ControllerStatus = ControllerStatus.Active;
    let visiting = false;
    const permissions: Record<ControllerPosition, ControllerPositionPermission> = {
      [ControllerPosition.DEL]: ControllerPositionPermission.Restricted,
      [ControllerPosition.GND]: ControllerPositionPermission.Restricted,
      [ControllerPosition.TWR]: ControllerPositionPermission.Restricted,
      [ControllerPosition.PTWR]: ControllerPositionPermission.Restricted,
      [ControllerPosition.APP]: ControllerPositionPermission.Restricted,
      [ControllerPosition.CTR]: ControllerPositionPermission.Restricted,
      [ControllerPosition.FSS]: ControllerPositionPermission.Restricted,
      [ControllerPosition.TMU]: ControllerPositionPermission.Restricted,
    };
    const expirations: Record<ControllerPosition, Date | null> = {
      [ControllerPosition.DEL]: null,
      [ControllerPosition.GND]: null,
      [ControllerPosition.TWR]: null,
      [ControllerPosition.PTWR]: null,
      [ControllerPosition.APP]: null,
      [ControllerPosition.CTR]: null,
      [ControllerPosition.FSS]: null,
      [ControllerPosition.TMU]: null,
    };

    for (const roleItem of item.roles) {
      const roleDetail = ROLE_MAP[roleItem.id];
      if (!roleDetail) {
        console.warn("Invalid role", roleItem);
        continue;
      }
      if (roleDetail.type === RoleType.Rating && roleDetail.extraValue !== ControllerRatingType.Student) {
        rating = roleDetail.value;
        ratingType = roleDetail.extraValue;
      } else if (roleDetail.type === RoleType.Position) {
        const pos = roleDetail.value;
        const newVal = roleDetail.extraValue;
        const curVal = permissions[pos];
        if (newVal > curVal) {
          permissions[pos] = newVal;
          expirations[pos] = roleItem.expires ? new Date(roleItem.expires) : null;
        }
      } else if (roleDetail.type === RoleType.Status) {
        status = roleDetail.value;
      } else if (roleItem.id === VISITING_CONTROLLER_ID) {
        visiting = true;
      }
    }

    return {
      ...item,
      rating,
      ratingType,
      status,
      visiting,
      permissions,
      expirations,
    };
  });

  const onShowAbsentChange = (e: CheckedState) => setShowAbsent(e === true);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex items-center gap-x-2">
        <Checkbox onCheckedChange={onShowAbsentChange} id="show-absent" />
        <Label htmlFor="show-absent">
          <Trans>Show Absence Controllers</Trans>
        </Label>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {controllers
          ?.sort((ca, cb) => {
            if (ca.rating !== cb.rating) {
              return cb.rating - ca.rating;
            }
            if (ca.visiting && !cb.visiting) {
              return 1;
            }
            if (!ca.visiting && cb.visiting) {
              return -1;
            }
            if (ca.status === ControllerStatus.Absence) {
              return 1;
            }
            if (cb.status === ControllerStatus.Absence) {
              return -1;
            }
            return ca.id - cb.id;
          })
          ?.filter((ctr) => showAbsent || ctr.status !== ControllerStatus.Absence)
          ?.map((ctr) => (
            <div key={ctr.id} className="hover:bg-secondary flex flex-col gap-4 border px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">
                  {ctr.first_name} {ctr.last_name}
                </span>
                <span className="text-sm font-light">{ctr.id}</span>
                <span className="font-bold">
                  {ControllerRating[ctr.rating]}
                  {ctr.visiting && <span className="font-light">(V)</span>}
                </span>
                {ctr.status === ControllerStatus.Absence && (
                  <span className="font-bold text-red-700">
                    <Trans>Absent</Trans>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 font-mono text-sm">
                <PermissionTag
                  permission={ctr.permissions[ControllerPosition.DEL]}
                  expiration={ctr.expirations[ControllerPosition.DEL]}
                  positionName="DEL"
                />
                <PermissionTag
                  permission={ctr.permissions[ControllerPosition.GND]}
                  expiration={ctr.expirations[ControllerPosition.GND]}
                  positionName="GND"
                />
                <PermissionTag
                  permission={ctr.permissions[ControllerPosition.TWR]}
                  expiration={ctr.expirations[ControllerPosition.TWR]}
                  positionName="TWR"
                />
                <PermissionTag
                  permission={ctr.permissions[ControllerPosition.PTWR]}
                  expiration={ctr.expirations[ControllerPosition.PTWR]}
                  positionName="Tier 2"
                />
                <PermissionTag
                  permission={ctr.permissions[ControllerPosition.APP]}
                  expiration={ctr.expirations[ControllerPosition.APP]}
                  positionName="APP"
                />
                <PermissionTag
                  permission={ctr.permissions[ControllerPosition.CTR]}
                  expiration={ctr.expirations[ControllerPosition.CTR]}
                  positionName="CTR"
                />
                <PermissionTag
                  permission={ctr.permissions[ControllerPosition.FSS]}
                  expiration={ctr.expirations[ControllerPosition.FSS]}
                  positionName="FSS"
                />
                <PermissionTag permission={ctr.permissions[ControllerPosition.TMU]} positionName="TMU" />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

import { PROBLEM_LABELS, ProblemDetails, VALIDATION_STATUS, VALIDATOR_NAMES } from "./message";
import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PopoverTrigger, PopoverContent, Popover } from "@/components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { components } from "@/lib/api";
import { matchesValidationField } from "@/lib/validation-field";
import { Trans } from "@lingui/react/macro";
import { createContext, FC, useContext, useId } from "react";
import { TbAlertSquareRounded } from "react-icons/tb";

export const FlightValidationContext = createContext<components["schemas"]["FlightValidationDto"] | null>(null);

function ValidationTag({ result }: { result: components["schemas"]["ValidatorExecutionDto"]; compact?: boolean }) {
  const validatorName = VALIDATOR_NAMES[result.id];
  const { short, name } = VALIDATION_STATUS[result.status];
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger render={<PopoverTrigger render={<Badge render={<button type="button" />} />} />}>
          {short}
        </TooltipTrigger>
        <TooltipContent>{validatorName}</TooltipContent>
      </Tooltip>
      <PopoverContent>
        <div className="flex flex-col gap-2">
          <div>
            <strong className="text-sm">{validatorName}</strong>
            <Badge className="ml-2">{name}</Badge>
          </div>
          <ValidationLocation field={result.field} />
          <ValidationProblems problems={result.problems} />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ValidationProblems({ problems }: { problems: components["schemas"]["ValidationProblemDto"][] }) {
  if (problems.length <= 0) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-2">
      {problems.map((problem, index) => (
        <li key={index} className="flex flex-col gap-1 text-sm wrap-break-word">
          <ProblemDetails problem={problem} />
        </li>
      ))}
    </ul>
  );
}

function ValidationLocation({ field }: { field: components["schemas"]["ValidationFieldDto"] }) {
  switch (field.kind) {
    case "leg": {
      const legNumber = field.index + 1;
      return (
        <p>
          <Trans>Leg {legNumber}</Trans>
        </p>
      );
    }
    case "multiple-legs": {
      const from = field.from + 1;
      const to = field.to;
      return (
        <p>
          <Trans>
            Legs {from}–{to}
          </Trans>
        </p>
      );
    }
    case "departure":
      return (
        <p>
          <Trans>Departure</Trans>
        </p>
      );
    case "arrival":
      return (
        <p>
          <Trans>Arrival</Trans>
        </p>
      );
    default: {
      const labels = {
        callsign: <Trans>Callsign</Trans>,
        "flight-rules": <Trans>Flight Rules</Trans>,
        "aircraft-type": <Trans>Aircraft Type</Trans>,
        "wake-category": <Trans>Wake Category</Trans>,
        equipment: <Trans>Equipment</Trans>,
        transponder: <Trans>Transponder</Trans>,
        airspeed: <Trans>Airspeed</Trans>,
        "cruising-level": <Trans>Cruising Level</Trans>,
        route: <Trans>Route</Trans>,
        "navigation-performance": <Trans>PBN</Trans>,
      };
      return <span>{labels[field.kind]}</span>;
    }
  }
}

export const InlineValidationTooltip: FC<{ field: components["schemas"]["ValidationFieldDto"] }> = ({ field }) => {
  const validations = useContext(FlightValidationContext);

  if (!validations) return null;

  const filtered = validations.validators.filter((v) => matchesValidationField(v.field, field));

  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {filtered.map((result) => (
        <ValidationTag key={`${result.id}:${JSON.stringify(result.field)}`} result={result} compact />
      ))}
    </span>
  );
};

interface ValidationProblemProps {
  validator: components["schemas"]["ValidatorExecutionDto"];
  problem: components["schemas"]["ValidationProblemDto"];
}

const ValidationProblem: FC<ValidationProblemProps> = ({ problem }) => {
  const titleId = useId();
  return (
    <Alert aria-labelledby={titleId}>
      {<TbAlertSquareRounded />}
      <AlertTitle id={titleId}>{PROBLEM_LABELS[problem.kind]}</AlertTitle>
      <AlertDescription>
        <ProblemDetails problem={problem} />
      </AlertDescription>
    </Alert>
  );
};

export const ValidationResult: FC<{ temporary?: boolean }> = ({ temporary = false }) => {
  const validations = useContext(FlightValidationContext);

  if (!validations) return null;

  const hasFailure = validations.validators.some((validator) => validator.status === "rejected");

  return (
    <div className="flex flex-col gap-2">
      {hasFailure && temporary && (
        <p>
          <Trans>Update the temporary flight plan above and run validation again.</Trans>
        </p>
      )}
      {hasFailure && !temporary && (
        <p>
          <Trans>
            Your flight plan has some problems, please
            <a href="https://my.vatsim.net/pilots/flightplan/" target="_blank" rel="noopener noreferrer">
              &nbsp;edit your flight plan on VATSIM&nbsp;
            </a>
            according to the information below.
          </Trans>
        </p>
      )}
      {validations.validators
        .flatMap((validator) => validator.problems.map((problem) => ({ validator, problem })))
        .map(({ validator, problem }) => (
          <ValidationProblem key={JSON.stringify({ validator, problem })} validator={validator} problem={problem} />
        ))}
    </div>
  );
};

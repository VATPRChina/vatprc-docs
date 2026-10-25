import { PROBLEM_LABELS, ProblemDetails, VALIDATION_STATUS, VALIDATOR_NAMES } from "./message";
import { components } from "@/lib/api";
import { matchesValidationField } from "@/lib/validation-field";
import { Trans } from "@lingui/react/macro";
import { Popover, Tooltip, Badge, Alert, Anchor } from "@mantine/core";
import { createContext, FC, useContext } from "react";
import { TbAlertSquareRounded } from "react-icons/tb";

export const FlightValidationContext = createContext<components["schemas"]["FlightValidationDto"] | null>(null);

function ValidationTag({ result }: { result: components["schemas"]["ValidatorExecutionDto"]; compact?: boolean }) {
  const validatorName = VALIDATOR_NAMES[result.id];
  const { short, name, color } = VALIDATION_STATUS[result.status];
  return (
    <Popover withArrow>
      <Popover.Target>
        <Tooltip label={validatorName}>
          <Badge component="button" type="button" variant="filled" color={color} size="sm" radius="xs">
            {short}
          </Badge>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        <div className="flex flex-col gap-2">
          <div>
            <strong className="text-sm">{validatorName}</strong>
            <Badge variant="filled" color={color} size="sm" radius="xs" className="ml-2">
              {name}
            </Badge>
          </div>
          <ValidationLocation field={result.field} />
          <ValidationProblems problems={result.problems} />
        </div>
      </Popover.Dropdown>
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
    default:
      return null;
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

const ValidationProblem: FC<ValidationProblemProps> = ({ validator, problem }) => {
  return (
    <Alert
      title={
        <span>
          {PROBLEM_LABELS[problem.kind]}
          <span className="ml-2 text-xs font-light">({VALIDATOR_NAMES[validator.id]})</span>
        </span>
      }
      icon={<TbAlertSquareRounded />}
      variant="outline"
      color={VALIDATION_STATUS[validator.status].color}
    >
      <ProblemDetails problem={problem} />
    </Alert>
  );
};

export const ValidationResult: FC = () => {
  const validations = useContext(FlightValidationContext);

  if (!validations) return null;

  const hasFailure = validations.validators.some((validator) => validator.status === "rejected");

  return (
    <div className="flex flex-col gap-2">
      {hasFailure && (
        <p>
          <Trans>
            Your flight plan has some problems, please
            <Anchor href="https://my.vatsim.net/pilots/flightplan/" target="_blank" rel="noopener noreferrer">
              &nbsp;edit your flight plan on VATSIM&nbsp;
            </Anchor>
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

import { Sheet } from "../sheet";
import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { components } from "@/lib/api";
import { $api, usePermission } from "@/lib/client";
import { renderWithMap } from "@/lib/helpers";
import { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { useQueryClient } from "@tanstack/react-query";
import { ComponentProps, FC, useState } from "react";

export const APPLICATION_STATUS: Map<components["schemas"]["AtcApplicationStatus"], MessageDescriptor> = new Map([
  ["submitted", msg`Submitted`],
  ["in-waitlist", msg`In Waitlist`],
  ["approved", msg`Accepted`],
  ["rejected", msg`Rejected`],
  ["aborted", msg`Aborted`],
]);

const ATC_APPLICATION_STATUS_ALERTS: Map<components["schemas"]["AtcApplicationStatus"], FC> = new Map([
  [
    "submitted",
    () => (
      <Alert>
        <AlertTitle>{<Trans>Submitted</Trans>}</AlertTitle>
        <AlertDescription>
          <Trans>Your application has been submitted and is pending review by the staff.</Trans>
        </AlertDescription>
      </Alert>
    ),
  ],
  [
    "in-waitlist",
    () => (
      <Alert>
        <AlertTitle>{<Trans>In Waitlist</Trans>}</AlertTitle>
        <AlertDescription>
          <Trans>
            Your application has been placed in the waitlist. You will be notified if a spot becomes available.
          </Trans>
        </AlertDescription>
      </Alert>
    ),
  ],
  [
    "approved",
    () => (
      <Alert>
        <AlertTitle>{<Trans>Accepted</Trans>}</AlertTitle>
        <AlertDescription>
          <Trans>Your application has been approved. Welcome to start growing to be a controller!</Trans>
        </AlertDescription>
      </Alert>
    ),
  ],
  [
    "rejected",
    () => (
      <Alert variant={"destructive"}>
        <AlertTitle>{<Trans>Rejected</Trans>}</AlertTitle>
        <AlertDescription>
          <Trans>
            We regret to inform you that your application has been rejected. Please check the remarks for more details.
          </Trans>
        </AlertDescription>
      </Alert>
    ),
  ],
  [
    "aborted",
    () => (
      <Alert variant={"destructive"}>
        <AlertTitle>{<Trans>Aborted</Trans>}</AlertTitle>
        <AlertDescription>
          <Trans>
            Your training has been aborted due to inactivity or other reasons. Please check the remarks for more
            details. You may contact the staff if you have any questions, or file an application again, which will be
            considered in priority.
          </Trans>
        </AlertDescription>
      </Alert>
    ),
  ],
]);

interface AtcApplicationStatusAlertProps {
  applicationId: string;
}

export const AtcApplicationStatusAlert: FC<AtcApplicationStatusAlertProps> = ({ applicationId }) => {
  const {
    data: application,
    error,
    isLoading,
  } = $api.useQuery("get", "/api/atc/applications/{id}", {
    params: { path: { id: applicationId } },
  });

  if (isLoading) {
    return <Skeleton style={{ height: 64 }} />;
  }
  if (error)
    return (
      <Alert variant={"destructive"}>
        <AlertDescription>{error.detail || error.title}</AlertDescription>
      </Alert>
    );
  if (!application) return null;

  return renderWithMap(ATC_APPLICATION_STATUS_ALERTS, application.status);
};

interface AtcApplicationStatusEditProps {
  applicationId: string;
}

export const AtcApplicationStatusEdit: FC<AtcApplicationStatusEditProps> = ({ applicationId }) => {
  const { i18n, t } = useLingui();
  const queryClient = useQueryClient();
  const hasPermission = usePermission("controller-training-director-assistant");

  const {
    data: application,
    error: applicationError,
    isLoading: isApplicationLoading,
  } = $api.useQuery("get", "/api/atc/applications/{id}", {
    params: { path: { id: applicationId } },
  });
  const { data: sheet, error: sheetError } = $api.useQuery("get", "/api/atc/applications/review-sheet");
  const { mutateAsync, error: mutationError, isSuccess } = $api.useMutation("put", "/api/atc/applications/{id}/review");

  const [status, setStatus] = useState<components["schemas"]["AtcApplicationStatus"] | null>(
    application?.status ?? null,
  );

  const onSubmit: ComponentProps<typeof Sheet>["onSubmit"] = async (answers) => {
    if (!status) return;
    await mutateAsync({ params: { path: { id: applicationId } }, body: { status, review_answers: answers } });
    await queryClient.invalidateQueries(
      $api.queryOptions("get", "/api/atc/applications/{id}", { params: { path: { id: applicationId ?? "" } } }),
    );
  };

  if (isApplicationLoading) {
    return <Skeleton style={{ height: 64 }} />;
  }
  if (applicationError)
    return (
      <Alert variant={"destructive"}>
        <AlertDescription>{applicationError.detail || applicationError.title}</AlertDescription>
      </Alert>
    );
  if (!application) return null;

  return (
    <div className="flex flex-col gap-1">
      {isSuccess && (
        <Alert>
          <AlertDescription>
            <Trans>The ATC application review has been updated successfully.</Trans>
          </AlertDescription>
        </Alert>
      )}
      {mutationError && (
        <Alert variant={"destructive"}>
          <AlertTitle>{mutationError.title}</AlertTitle>
          <AlertDescription>{mutationError.detail}</AlertDescription>
        </Alert>
      )}
      {sheetError && (
        <Alert variant={"destructive"}>
          <AlertTitle>{sheetError.title}</AlertTitle>
          <AlertDescription>{sheetError.detail}</AlertDescription>
        </Alert>
      )}
      {isApplicationLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <>
          <label className="grid gap-1.5 text-sm">
            <span className="font-heading">{t`Status`}</span>
            <NativeSelect
              aria-label={t`Status`}
              disabled={!hasPermission}
              value={status ?? application.status ?? ""}
              onChange={(event) => {
                const value = event.currentTarget.value || null;
                return setStatus(value as components["schemas"]["AtcApplicationStatus"] | null);
              }}
            >
              <NativeSelectOption value=""></NativeSelectOption>
              {(
                APPLICATION_STATUS.entries()
                  .map(([id, name]) => ({ value: id, label: i18n.t(name) }))
                  .toArray() ?? []
              ).map((option) => {
                const item = typeof option === "string" ? { value: option, label: option } : option;
                return (
                  <NativeSelectOption key={item.value} value={item.value}>
                    {item.label}
                  </NativeSelectOption>
                );
              })}
            </NativeSelect>
          </label>
        </>
      )}
      <Sheet
        className="contents"
        sheet={sheet}
        existingFillingAnswers={application.review_filing_answers ?? []}
        onSubmit={onSubmit}
        isFieldValuesLoading={isApplicationLoading}
        isSubmitDisabled={!status || status === application.status}
        isSubmitHidden={!hasPermission}
        submitButtonContent={<Trans>Submit</Trans>}
        doNotRequirePristine
        confirm={<Trans>Are you sure you want to submit the application review?</Trans>}
      />
    </div>
  );
};

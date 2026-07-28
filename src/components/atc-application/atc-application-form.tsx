import { Sheet } from "../sheet";
import { $api } from "@/lib/client";
import { wrapPromiseWithLog } from "@/lib/utils";
import { Trans } from "@lingui/react/macro";
import { Alert, Skeleton, Checkbox, Card } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { ComponentProps, FC, useState } from "react";
import { TbUser } from "react-icons/tb";

const CHECKLIST = [
  { value: "age", label: <Trans>I am over 16 years old.</Trans> },
  { value: "division", label: <Trans>My account belongs to VATPRC division.</Trans> },
  {
    value: "experience",
    label: (
      <Trans>
        I have sufficient experience on VATSIM. I have connected as a pilot for more than 150 hours and have
        participated in more than 10 official events of VATPRC.
      </Trans>
    ),
  },
  {
    value: "coc",
    label: <Trans>I am familiar with VATSIM regulations, and do not have violation record recently.</Trans>,
  },
  {
    value: "english",
    label: <Trans>I have sufficient English proficiency to provide ATC service in both Chinese and English.</Trans>,
  },
  { value: "time", label: <Trans>I will ensure to have sufficient ATC online time.</Trans> },
  {
    value: "privacy",
    label: (
      <Trans>
        I agree to the Privacy Policy of VATSIM and VATPRC, and I consent to my full name, CID, and controller rating
        being publicized in VATSIM.
      </Trans>
    ),
  },
];

interface AtcApplicationFormProps {
  applicationId?: string;
}

export const AtcApplicationForm: FC<AtcApplicationFormProps> = ({ applicationId }) => {
  const { navigate } = useRouter();
  const queryClient = useQueryClient();

  const { data: user, error: userError, isLoading: isUserLoading } = $api.useQuery("get", "/api/users/me");
  const {
    data: applySheet,
    error: sheetError,
    isLoading: isSheetLoading,
  } = $api.useQuery("get", "/api/atc/applications/sheet");
  const {
    data: existingApplication,
    error: applicationError,
    isLoading: isValuesLoading,
  } = $api.useQuery("get", "/api/atc/applications/{id}", {
    params: { path: { id: applicationId ?? "" } },
    enabled: !!applicationId,
  });
  const { mutateAsync: createAsync, error: createError } = $api.useMutation("post", "/api/atc/applications");
  const {
    mutateAsync: updateAsync,
    error: updateError,
    isSuccess: isUpdateSuccess,
  } = $api.useMutation("put", "/api/atc/applications/{id}");

  const onCreateSuccess = wrapPromiseWithLog(async () => {
    await queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/applications"));
    await navigate({ to: "/controllers" });
  });
  const onUpdateSuccess = wrapPromiseWithLog(async () => {
    await queryClient.invalidateQueries(
      $api.queryOptions("get", "/api/atc/applications/{id}", { params: { path: { id: applicationId ?? "" } } }),
    );
  });

  const onSubmit: ComponentProps<typeof Sheet>["onSubmit"] = (answers) => {
    const body = { request_answers: answers };
    if (applicationId) {
      return updateAsync({ params: { path: { id: applicationId } }, body }, { onSuccess: onUpdateSuccess });
    }
    return createAsync({ body }, { onSuccess: onCreateSuccess });
  };

  const [value, setValue] = useState<string[]>([]);
  const isEditDisabled =
    !!applicationId && (existingApplication?.status !== "submitted" || existingApplication?.user_id !== user?.id);

  if (!user && !isUserLoading) {
    return <Alert icon={<TbUser />} title={<Trans>Please login to file an application.</Trans>}></Alert>;
  }

  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-lg">
        <Trans>Basic Information</Trans>
      </h2>
      <Skeleton visible={isUserLoading || isValuesLoading}>
        <p className="text-sm font-bold">
          <Trans>CID</Trans>
        </p>
        <Card withBorder className="mt-1 text-sm" padding="xs">
          <pre className="font-sans">{(applicationId ? existingApplication?.user?.cid : user?.cid) ?? ""}</pre>
        </Card>
      </Skeleton>
      <Skeleton visible={isUserLoading || isValuesLoading}>
        <p className="text-sm font-bold">
          <Trans>Full Name</Trans>
        </p>
        <Card withBorder className="mt-1 text-sm" padding="xs">
          <pre className="font-sans">
            {(applicationId ? existingApplication?.user?.full_name : (user?.full_name ?? user?.full_name)) ?? ""}
          </pre>
        </Card>
      </Skeleton>
      <h2 className="text-lg">
        <Trans>Application Information</Trans>
      </h2>
      {isUpdateSuccess && (
        <Alert color="green">
          <Trans>Your ATC application has been updated successfully.</Trans>
        </Alert>
      )}
      {(createError ?? updateError) && (
        <Alert color="red" title={(createError ?? updateError)?.title}>
          {(createError ?? updateError)?.detail}
        </Alert>
      )}
      {(userError ?? sheetError ?? applicationError) && (
        <Alert color="red" title={(userError ?? sheetError ?? applicationError)?.title}>
          {(userError ?? sheetError ?? applicationError)?.detail}
        </Alert>
      )}
      {isSheetLoading && <Skeleton h={256} />}
      <Sheet
        className="contents"
        sheet={applySheet}
        existingFillingAnswers={existingApplication?.application_filing_answers}
        onSubmit={onSubmit}
        isFieldValuesLoading={isValuesLoading}
        isSubmitDisabled={value.length < CHECKLIST.length}
        isSubmitHidden={isEditDisabled}
        submitButtonContent={applicationId ? <Trans>Edit</Trans> : <Trans>Submit</Trans>}
        footer={
          <>
            {!applicationId && (
              <>
                <h2 className="text-lg">
                  <Trans>Checklist</Trans>
                </h2>
                <Checkbox.Group value={value} onChange={setValue}>
                  <div className="flex flex-col gap-1">
                    {CHECKLIST.map((item) => (
                      <Checkbox key={item.value} value={item.value} label={item.label} />
                    ))}
                  </div>
                </Checkbox.Group>
              </>
            )}
          </>
        }
      />
    </div>
  );
};

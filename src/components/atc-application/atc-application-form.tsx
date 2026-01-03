import { Sheet } from "../sheet";
import { $api } from "@/lib/client";
import { wrapPromiseWithLog } from "@/lib/utils";
import { useLingui, Trans } from "@lingui/react/macro";
import { TextInput, Alert, Skeleton, Checkbox } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { ComponentProps, FC, useState } from "react";

interface AtcApplicationFormProps {
  applicationId?: string;
}

export const AtcApplicationForm: FC<AtcApplicationFormProps> = ({ applicationId }) => {
  const { t } = useLingui();

  const { navigate } = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading: isUserLoading } = $api.useQuery("get", "/api/users/me");
  const {
    data: applySheet,
    error,
    isLoading: isSheetLoading,
  } = $api.useQuery("get", "/api/users/me/atc/applications/sheet");
  const { data: existingApplication, isLoading: isValuesLoading } = $api.useQuery("get", "/api/atc/applications/{id}", {
    params: { path: { id: applicationId ?? "" } },
    enabled: !!applicationId,
  });
  const { mutateAsync: createAsync } = $api.useMutation("post", "/api/users/me/atc/applications");
  const { mutateAsync: updateAsync } = $api.useMutation("put", "/api/users/me/atc/applications/{id}");

  const onCreateSuccess = wrapPromiseWithLog(async () => {
    await queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/applications"));
    notifications.show({
      title: t`Application submitted`,
      message: t`Your ATC application has been submitted successfully.`,
      color: "green",
    });
    await navigate({ to: "/controllers/applications" });
  });
  const onUpdateSuccess = wrapPromiseWithLog(async () => {
    await queryClient.invalidateQueries(
      $api.queryOptions("get", "/api/atc/applications/{id}", { params: { path: { id: applicationId ?? "" } } }),
    );
    notifications.show({
      title: t`Application updated`,
      message: t`Your ATC application has been updated successfully.`,
      color: "green",
    });
  });

  const onSubmit: ComponentProps<typeof Sheet>["onSubmit"] = (answers) => {
    const body = { request_answers: answers };
    if (applicationId) {
      return updateAsync({ params: { path: { id: applicationId } }, body }, { onSuccess: onUpdateSuccess });
    }
    return createAsync({ body }, { onSuccess: onCreateSuccess });
  };

  const [value, setValue] = useState<string[]>([]);
  const isEditDisabled = !!applicationId && existingApplication?.status !== "submitted";

  return (
    <div className="flex flex-col gap-2">
      {!applicationId && (
        <>
          <h2 className="text-lg">
            <Trans>Checklist</Trans>
          </h2>
          <Checkbox.Group value={value} onChange={setValue}>
            <div className="flex flex-col gap-2">
              <Checkbox value="division" label={<Trans>Account belongs to VATPRC division</Trans>} />
              <Checkbox value="experience" label={<Trans>Have sufficient experience on VATSIM</Trans>} />
              <Checkbox value="coc" label={<Trans>Familiar with VATSIM regulations</Trans>} />
              <Checkbox value="english" label={<Trans>Sufficient English proficiency</Trans>} />
              <Checkbox value="time" label={<Trans>Sufficient online availability</Trans>} />
            </div>
          </Checkbox.Group>
        </>
      )}
      <h2 className="text-lg">
        <Trans>Basic Information</Trans>
      </h2>
      <Skeleton visible={isUserLoading}>
        <TextInput label={t`CID`} value={user?.cid ?? ""} disabled />
      </Skeleton>
      <Skeleton visible={isUserLoading}>
        <TextInput label={t`Full Name`} value={user?.full_name ?? ""} disabled />
      </Skeleton>
      <h2 className="text-lg">
        <Trans>Application Information</Trans>
      </h2>
      {error && <Alert title="Error">{error.message}</Alert>}
      {isSheetLoading && <Skeleton h={256} />}
      <Sheet
        className="contents"
        sheet={applySheet}
        existingFillingAnswers={existingApplication?.application_filing_answers}
        onSubmit={onSubmit}
        isFieldValuesLoading={isValuesLoading}
        isSubmitDisabled={value.length < 5}
        isSubmitHidden={isEditDisabled}
        submitButtonContent={applicationId ? <Trans>Edit</Trans> : <Trans>Submit</Trans>}
      />
    </div>
  );
};

import { components, paths } from "../api";
import { authMiddleware } from "./auth";
import { assumedRolesAtom, createRoleAssumptionMiddleware } from "./role-assumption";
import { notifications } from "@mantine/notifications";
import { getDefaultStore } from "jotai";
import createClient, { Middleware } from "openapi-fetch";
import createQueryClient from "openapi-react-query";

const throwMiddleware: Middleware = {
  async onResponse({ response }) {
    if (response.ok) return;

    const body = (await response
      .clone()
      .json()
      .catch(() => ({}))) as Partial<components["schemas"]["ProblemDetails"]>;
    const status = response.status;
    if (
      typeof window !== "undefined" &&
      body.type !== "urn:vatprc-uniapi-error:unauthorized" &&
      body.type !== "urn:vatprc-uniapi-error:invalid-token" &&
      status >= 500
    ) {
      const error = new Error(body.detail ?? response.statusText, {
        cause: {
          status,
          title: body.title,
          type: body.type,
          url: response.url,
        },
      });
      error.name = body.title ?? "ServerError";
      console.error(error);
      void import("@sentry/tanstackstart-react")
        .then(({ captureException }) =>
          captureException(error, {
            extra: {
              problem: body,
              status,
              url: response.url,
            },
          }),
        )
        .catch((sentryError) => console.error("Failed to report API error to Sentry", sentryError));
      notifications.show({
        title: body.title ?? response.statusText,
        message: body.detail,
        color: "red",
      });
    }
  },

  onError({ error }) {
    if (error instanceof Error && error.name === "AbortError") return;

    if (error instanceof Error) {
      return Response.json(
        {
          type: error.name,
          title: error.name,
          status: 0,
          detail: error.message,
        },
        { status: 500 },
      );
    }

    return;
  },
};

export const client = createClient<paths>({ baseUrl: import.meta.env.VITE_API_ENDPOINT });
client.use(authMiddleware);
client.use(createRoleAssumptionMiddleware(() => getDefaultStore().get(assumedRolesAtom)));
client.use(throwMiddleware);

export const $api = createQueryClient(client);

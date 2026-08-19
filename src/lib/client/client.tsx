import { components, paths } from "../api";
import { authMiddleware } from "./auth";
import { assumedRolesAtom, createRoleAssumptionMiddleware } from "./role-assumption";
import { Trans } from "@lingui/react/macro";
import { notifications } from "@mantine/notifications";
import { getDefaultStore } from "jotai";
import createClient, { Middleware } from "openapi-fetch";
import createQueryClient from "openapi-react-query";

const NETWORK_ERROR_MESSAGES = [
  "failed to fetch",
  "fetch failed",
  "load failed",
  "networkerror when attempting to fetch resource",
  "network request failed",
  "the internet connection appears to be offline",
  "the network connection was lost",
  "could not connect to the server",
  "a server with the specified hostname could not be found",
];

function isNetworkError(name: string | undefined, message: string | undefined) {
  if (name === "NetworkError") return true;
  if (name !== "TypeError") return false;

  const normalizedMessage = message?.toLowerCase();
  return normalizedMessage !== undefined && NETWORK_ERROR_MESSAGES.some((value) => normalizedMessage.includes(value));
}

const throwMiddleware: Middleware = {
  async onResponse({ response }) {
    if (response.ok) return;

    const body = (await response
      .clone()
      .json()
      .catch(() => ({}))) as Partial<components["schemas"]["ProblemDetails"]>;
    const status = response.status;

    if (typeof window === "undefined") return;
    if (body.type === "urn:vatprc-uniapi-error:unauthorized") return;
    if (body.type === "urn:vatprc-uniapi-error:invalid-token") return;
    if (status !== 0 && status < 500) return;

    if (isNetworkError(body.type, body.detail)) {
      const detail = body.detail ?? "unknown network error";
      notifications.show({
        title: <Trans>Network Error</Trans>,
        message: <Trans>Failed to fetch contents due to {{ detail }}.</Trans>,
        color: "red",
      });
      return;
    }

    const error = new Error(body.detail ?? response.statusText, {
      cause: {
        status,
        title: body.title,
        type: body.type,
        url: response.url,
      },
    });
    error.name = body.title ?? "ServerError";
    console.error("Unexpected error", error);
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
  },

  onError({ error }) {
    if (error instanceof Error && error.name === "AbortError") return;

    if (error instanceof Error) {
      return Response.json(
        {
          type: error.name,
          title: error.name,
          status: 500,
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

import { components, paths } from "../api";
import { authMiddleware } from "./auth";
import { notifications } from "@mantine/notifications";
import createClient, { Middleware } from "openapi-fetch";
import createQueryClient from "openapi-react-query";

const throwMiddleware: Middleware = {
  async onResponse({ response }) {
    if (response.ok) return;

    const body = (await response.clone().json()) as components["schemas"]["ProblemDetails"];
    if (body.type !== "urn:vatprc-uniapi-error:unauthorized") {
      notifications.show({
        title: body.title,
        message: body.detail,
        color: "red",
      });
    }
  },
};

export const client = createClient<paths>({ baseUrl: import.meta.env.VITE_API_ENDPOINT });
client.use(authMiddleware);
client.use(throwMiddleware);

export const $api = createQueryClient(client);

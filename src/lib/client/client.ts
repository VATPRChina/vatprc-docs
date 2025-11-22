import { paths } from "../api";
import { ApiError } from "./ApiError";
import { authMiddleware } from "./auth";
import { notifications } from "@mantine/notifications";
import createClient, { Middleware } from "openapi-fetch";
import createQueryClient from "openapi-react-query";

const throwMiddleware: Middleware = {
  async onResponse({ response }) {
    if (!response.ok) {
      const body = (await response.clone().json()) as { message: string; error_code: string };
      const err = new ApiError(body.message, response.status, body.error_code);
      if (err.errorCode !== "INVALID_TOKEN") throw err;
    }
  },
  onError(err) {
    if (err.error instanceof ApiError) {
      notifications.show({
        title: err.error.name,
        message: err.error.message,
        color: "red",
      });
    }
  },
};

export const client = createClient<paths>({ baseUrl: import.meta.env.VITE_API_ENDPOINT });
client.use(authMiddleware);
client.use(throwMiddleware);

export const $api = createQueryClient(client);

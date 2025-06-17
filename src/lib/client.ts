import { paths } from "./api";
import createClient, { Middleware } from "openapi-fetch";
import createQueryClient from "openapi-react-query";
import { toast } from "sonner";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly errorCode?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const throwMiddleware: Middleware = {
  async onResponse({ response }) {
    if (!response.ok) {
      const body = (await response.clone().json()) as { message: string; error_code: string };
      const err = new ApiError(body.message, response.status, body.error_code);
      if (err.errorCode !== "INVALID_TOKEN") throw err;
    }
  },
  onError(err) {
    if (err.error instanceof Error) toast(err.error.name, { description: err.error.message });
  },
};

export const client = createClient<paths>({ baseUrl: import.meta.env.VITE_API_ENDPOINT });
client.use(throwMiddleware);

export const $api = createQueryClient(client);

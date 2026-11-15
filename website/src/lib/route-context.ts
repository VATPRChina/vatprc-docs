import { I18n } from "@lingui/core";
import { QueryClient } from "@tanstack/react-query";

export interface MyRouterContext {
  i18n: I18n;
  queryClient: QueryClient;
}

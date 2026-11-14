import { TooltipProvider } from "@/components/ui/tooltip";
import { messages as en } from "@/locales/en.po";
import { setupI18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { ReactNode } from "react";
import { render } from "vitest-browser-react";

const i18n = setupI18n({ locale: "en", messages: { en } });

const AppTestProviders = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <TooltipProvider>{children}</TooltipProvider>
  </I18nProvider>
);

export const renderComponent = (component: ReactNode) =>
  render(component, {
    wrapper: AppTestProviders,
  });

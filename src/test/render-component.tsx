import { messages as en } from "@/locales/en.po";
import { theme } from "@/theme";
import { setupI18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { MantineProvider } from "@mantine/core";
import { ReactNode } from "react";
import { render } from "vitest-browser-react";

const i18n = setupI18n({ locale: "en", messages: { en } });

const AppTestProviders = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <MantineProvider theme={theme} forceColorScheme="light">
      {children}
    </MantineProvider>
  </I18nProvider>
);

export const renderComponent = (component: ReactNode) =>
  render(component, {
    wrapper: AppTestProviders,
  });

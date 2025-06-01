import { LanguageToggle } from "./language-toggle";
import { m } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/runtime";
import { useRouterState } from "@tanstack/react-router";
import { page } from "@vitest/browser/context";
import { describe, expect, it, vi, Mock } from "vitest";
import { render } from "vitest-browser-react";

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return { ...actual, useRouterState: vi.fn() };
});

vi.mock("@/lib/i18n/runtime", async () => {
  const actual = await vi.importActual<typeof import("@/lib/i18n/runtime")>("@/lib/i18n/runtime");
  return { ...actual, getLocale: vi.fn() };
});

describe("LanguageToggle", () => {
  it("renders the button in English", async () => {
    (useRouterState as Mock).mockReturnValue({ location: { pathname: "/" } });
    (getLocale as Mock).mockReturnValue("en");
    render(<LanguageToggle />);
    await expect.element(page.getByLabelText(m["layout_switch_chinese"]())).toBeInTheDocument();
  });

  it("renders the button in Chinese", async () => {
    (useRouterState as Mock).mockReturnValue({ location: { pathname: "/" } });
    (getLocale as Mock).mockReturnValue("zh-cn");
    render(<LanguageToggle />);
    await expect.element(page.getByLabelText(m["layout_switch_english"]())).toBeInTheDocument();
  });

  it.todo("redirect to Chinese in English", async () => {
    (useRouterState as Mock).mockReturnValue({ location: { pathname: "/" } });
    (getLocale as Mock).mockReturnValue("en");
    render(<LanguageToggle />);
    await page.getByLabelText(m["layout_switch_chinese"]()).click();
    // TODO: find a way to mock window.location.assign
    expect(window.localStorage.getItem("vatprc-homepage-locale")).toBe("zh-cn");
  });

  it.todo("redirect to English in Chinese", async () => {
    (useRouterState as Mock).mockReturnValue({ location: { pathname: "/" } });
    (getLocale as Mock).mockReturnValue("zh-cn");
    render(<LanguageToggle />);
    await page.getByLabelText(m["layout_switch_english"]()).click();
    expect(window.localStorage.getItem("vatprc-homepage-locale")).toBe("en");
  });
});

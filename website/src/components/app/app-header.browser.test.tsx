import { AppHeader } from "./app-header";
import { Hero } from "@/components/homepage/hero";
import { renderComponent } from "@/test/render-component";
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { createStore, Provider } from "jotai";
import { afterEach, expect, test, vi } from "vitest";
import { page } from "vitest/browser";

vi.mock("@/lib/client", () => ({
  usePermissions: () => [],
  $api: { useQuery: () => ({ data: undefined }) },
}));
vi.mock("./user-info", () => ({ UserInfo: () => null }));
vi.mock("@/lib/utils", async () => ({ cn: (await import("clsx")).clsx, getPathname: () => "/" }));
vi.mock("@/lib/settings", () => ({
  isColorScheme: (value: string) => ["light", "dark", "auto"].includes(value),
  getCookie: () => null,
  setCookie: vi.fn(),
  isLocale: () => false,
  LANGUAGE_COOKIE_KEY: "locale",
}));

afterEach(async () => {
  window.scrollTo(0, 0);
  await page.viewport(1024, 768);
});

test.each([390, 1280])("header overlays the hero and becomes solid after scrolling at width %s", async (width) => {
  await page.viewport(width, 844);
  const route = createRootRoute({
    component: () => (
      <div className="grid">
        <AppHeader overlayHero />
        <main className="col-start-1 row-start-1 min-w-0">
          <Hero />
          <div style={{ height: 1600 }} />
        </main>
      </div>
    ),
  });
  const router = createRouter({ routeTree: route, history: createMemoryHistory({ initialEntries: ["/"] }) });
  await router.load();
  const screen = await renderComponent(
    <Provider store={createStore()}>
      <RouterProvider router={router} />
    </Provider>,
  );
  const header = document.querySelector("header")!;
  const hero = document.querySelector("[data-homepage-hero]")!;
  await expect.element(screen.getByRole("banner")).toHaveAttribute("data-over-hero", "true");
  expect(header.getBoundingClientRect().top).toBe(hero.getBoundingClientRect().top);
  await expect.poll(() => getComputedStyle(header).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
  await page.screenshot();

  window.scrollTo(0, 600);
  await expect.element(screen.getByRole("banner")).not.toHaveAttribute("data-over-hero");
  expect(header.getBoundingClientRect().top).toBe(0);
  await expect.poll(() => getComputedStyle(header).backgroundColor).toBe("rgb(255, 255, 255)");
  window.scrollTo(0, 0);
  await expect.element(screen.getByRole("banner")).toHaveAttribute("data-over-hero", "true");
});

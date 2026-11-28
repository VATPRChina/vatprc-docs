import { expect, test } from "playwright/test";

test("navigates from an empty event calendar to event history", async ({ page, baseURL }) => {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== baseURL) return route.abort();
    switch (url.pathname) {
      case "/uniapi/api/session":
        return route.fulfill({ json: { user: null } });
      case "/uniapi/api/events":
      case "/uniapi/api/events/past":
        return route.fulfill({ json: [] });
      default:
        if (url.pathname.startsWith("/uniapi/")) return route.fulfill({ status: 404 });
        return route.continue();
    }
  });

  await page.goto("/en/events");
  await expect(page.getByRole("heading", { name: "Nothing on the calendar yet" })).toBeVisible();
  await page.getByRole("link", { name: "Browse past events" }).click();
  await expect(page).toHaveURL(/\/events\/history\?range=recent$/);
  await expect(page.getByText("No past events found in the selected time range.")).toBeVisible();
});

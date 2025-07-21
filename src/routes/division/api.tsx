import { ApiReferenceReact } from "@scalar/api-reference-react";
import scalaCss from "@scalar/api-reference-react/style.css?url";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/division/api")({
  component: RouteComponent,
  head() {
    return { links: [{ rel: "stylesheet", href: scalaCss }] };
  },
});

function RouteComponent() {
  return (
    <ApiReferenceReact
      configuration={{
        url: import.meta.env.VITE_API_ENDPOINT + "/openapi/v1.json",
        baseServerURL: import.meta.env.VITE_API_ENDPOINT,
      }}
    />
  );
}

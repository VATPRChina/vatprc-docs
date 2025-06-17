/// <reference types="vinxi/types/client" />
import { createRouter } from "@/router";
import { StartClient } from "@tanstack/react-start";
import { hydrateRoot } from "react-dom/client";

const router = createRouter();

hydrateRoot(document, <StartClient router={router} />);

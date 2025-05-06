"use client";

import { useEffect } from "react";

export const RemoveServiceWorker: React.FC = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (const registration of registrations) {
          console.log(
            `Removing service worker: ${registration.active?.scriptURL}`,
          );
          registration.unregister();
        }
      });
    }
  });
  return null;
};

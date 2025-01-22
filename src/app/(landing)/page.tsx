"use client";

import languageDetector from "next-language-detector";
import { routing } from "@/i18n/routing";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const lngDetector = languageDetector({
  supportedLngs: [...routing.locales],
  fallbackLng: routing.defaultLocale,
});

const HomePage = () => {
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    const detectedLng = lngDetector.detect();
    console.log(pathname);
    if (pathname == "/") {
      router.replace("/" + detectedLng);
    }
  });
  return <></>;
};

export default HomePage;

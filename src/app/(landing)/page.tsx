"use client";

import { routing } from "@/lib/i18n/routing";
import languageDetector from "next-language-detector";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

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

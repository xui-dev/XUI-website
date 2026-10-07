"use client";

import React, { createContext, useContext, useEffect } from "react";
import enMessages from "../../messages/en.json";

type Locale = "en";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dir: "ltr";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: any;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  dir: "ltr",
  messages: enMessages,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale: Locale = "en";
  const dir = "ltr";
  const messages = enMessages;

  useEffect(() => {
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale: () => {},
        dir,
        messages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

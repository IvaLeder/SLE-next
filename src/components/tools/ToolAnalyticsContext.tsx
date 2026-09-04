"use client";

import { createContext, useContext } from "react";

export type ToolAnalyticsSource = "detail" | "article";

const ToolAnalyticsContext = createContext<ToolAnalyticsSource>("detail");

export function ToolAnalyticsProvider({
  source,
  children,
}: {
  source: ToolAnalyticsSource;
  children: React.ReactNode;
}) {
  return (
    <ToolAnalyticsContext.Provider value={source}>
      {children}
    </ToolAnalyticsContext.Provider>
  );
}

export function useToolAnalyticsSource(): ToolAnalyticsSource {
  return useContext(ToolAnalyticsContext);
}

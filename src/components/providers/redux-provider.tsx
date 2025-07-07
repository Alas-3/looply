// src/components/providers/redux-provider.tsx
"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/store";

// Create the store once in the client
const store = makeStore();

export function ReduxProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
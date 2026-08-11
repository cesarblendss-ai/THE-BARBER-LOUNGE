"use client";

import { createContext, useContext } from "react";

const EditModeContext = createContext(false);

type EditModeProviderProps = {
  enabled: boolean;
  children: React.ReactNode;
};

export function EditModeProvider({ enabled, children }: EditModeProviderProps) {
  return <EditModeContext.Provider value={enabled}>{children}</EditModeContext.Provider>;
}

export function useEditMode(): boolean {
  return useContext(EditModeContext);
}

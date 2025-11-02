import React, { createContext, useContext, useState, useEffect } from "react";
import type { Id } from "../../convex/_generated/dataModel";

const CONTEXT_STORAGE_KEY = "selectedContextId";

interface ContextContextType {
  selectedContextId: Id<"contexts"> | null;
  setSelectedContextId: (contextId: Id<"contexts"> | null) => void;
}

const ContextContext = createContext<ContextContextType | undefined>(undefined);

function getStoredContextId(): Id<"contexts"> | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(CONTEXT_STORAGE_KEY);
  return stored ? (stored as Id<"contexts">) : null;
}

function saveStoredContextId(contextId: Id<"contexts"> | null) {
  if (typeof window === "undefined") return;
  if (contextId) {
    localStorage.setItem(CONTEXT_STORAGE_KEY, contextId);
  } else {
    localStorage.removeItem(CONTEXT_STORAGE_KEY);
  }
}

export function ContextProvider({ children }: { children: React.ReactNode }) {
  const [selectedContextId, setSelectedContextIdState] =
    useState<Id<"contexts"> | null>(getStoredContextId);

  const setSelectedContextId = (contextId: Id<"contexts"> | null) => {
    setSelectedContextIdState(contextId);
    saveStoredContextId(contextId);
  };

  // Listen for storage changes (e.g., from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CONTEXT_STORAGE_KEY) {
        setSelectedContextIdState(
          e.newValue ? (e.newValue as Id<"contexts">) : null
        );
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <ContextContext.Provider
      value={{ selectedContextId, setSelectedContextId }}
    >
      {children}
    </ContextContext.Provider>
  );
}

export function useSelectedContext() {
  const context = useContext(ContextContext);
  if (context === undefined) {
    throw new Error("useSelectedContext must be used within a ContextProvider");
  }
  return context;
}

import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { syncLocalWithFirestore, type SyncStatus } from "../services/sync.service";
import { useAuth } from "./AuthContext";

interface SyncContextType {
  status: SyncStatus;
  triggerSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<SyncStatus>("online");

  useEffect(() => {
    if (Platform.OS === "web") {
      const handleOnline = () => {
        setStatus("online");
        if (user) handleSync();
      };
      const handleOffline = () => {
        setStatus("offline");
      };

      if (typeof window !== "undefined") {
        if (!navigator.onLine) {
          setStatus("offline");
        }
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
          window.removeEventListener("online", handleOnline);
          window.removeEventListener("offline", handleOffline);
        };
      }
    } else {
      try {
        const unsubscribe = NetInfo.addEventListener((state) => {
          const isOnline = !!state.isConnected && !!state.isInternetReachable;
          if (!isOnline) {
            setStatus("offline");
          } else if (status === "offline") {
            setStatus("online");
            if (user) handleSync();
          }
        });
        return unsubscribe;
      } catch {
        // Fallback para caso o módulo nativo não esteja disponível
      }
    }
  }, [user, status]);

  async function handleSync() {
    if (!user) return;
    setStatus("syncing");
    try {
      await syncLocalWithFirestore();
      setStatus("synced");
      setTimeout(() => {
        setStatus("online");
      }, 3000);
    } catch {
      setStatus("online");
    }
  }

  return (
    <SyncContext.Provider
      value={{
        status,
        triggerSync: handleSync,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    throw new Error("useSync deve ser usado dentro de um SyncProvider");
  }
  return ctx;
}

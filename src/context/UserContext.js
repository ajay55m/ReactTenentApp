// src/context/UserContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { useSession } from "./SessionContext";
import { getApprovedClient } from "../apiConfig"; // ✅ use apiConfig

export const UserContext = createContext({
  profile: null,
  loading: true,
  reloadProfile: () => { },
});

export const UserProvider = ({ children }) => {
  const { session, isReady } = useSession();

  const clientId = session?.clientId;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    if (!isReady || !clientId) return; // ⛔ wait for session

    try {
      setLoading(true);

      // ✅ API helper usage
      const { ok, status, data } = await getApprovedClient(clientId);

      if (!ok) {
        console.warn("Profile API failed:", status);
        return;
      }

      setProfile(data);
    } catch (err) {
      console.log("Profile load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Reload when login/session changes
  useEffect(() => {
    loadProfile();
  }, [clientId, isReady]);

  return (
    <UserContext.Provider
      value={{
        profile,
        loading,
        reloadProfile: loadProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

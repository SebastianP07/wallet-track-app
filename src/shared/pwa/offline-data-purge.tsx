"use client";

import { useEffect } from "react";

import { clearOfflineData } from "./offline-data";

// For a page the server has just found no session for, however the session ended.
export function OfflineDataPurge() {
  useEffect(() => {
    void clearOfflineData();
  }, []);
  return null;
}

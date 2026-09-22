import { useState, useEffect } from "react";
import SavedStorage from "@/services/storage/savedStorage";

export function useSavedOrganizations() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    SavedStorage.getSavedIds().then((ids) => {
      setSavedIds(ids);
      setLoading(false);
    });

    // Subscribe to live changes across all screens
    const unsubscribe = SavedStorage.subscribe((updatedIds) => {
      setSavedIds(updatedIds);
    });

    return () => unsubscribe();
  }, []);

  const toggleSave = async (orgId: string) => {
    return await SavedStorage.toggleSave(orgId);
  };

  const isSaved = (orgId: string) => savedIds.includes(orgId);

  return {
    savedIds,
    isSaved,
    toggleSave,
    loading,
  };
}

export default useSavedOrganizations;

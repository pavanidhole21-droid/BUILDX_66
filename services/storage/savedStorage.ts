import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@bloodhelp_saved_organizations_v1";

export interface SavedOrganizationEntry {
  organizationId: string;
  savedAt: string;
}

// Initial 5 saved organizations matching Image 2
const INITIAL_SAVED_IDS = [
  "org_gmch",
  "org_redcross",
  "org_helpinghands",
  "org_lifecare",
  "org_cityblood",
];

// In-memory listeners for instantaneous UI reactivity across screens
type Listener = (savedIds: string[]) => void;
const listeners: Set<Listener> = new Set();

const notifyListeners = (ids: string[]) => {
  listeners.forEach((listener) => {
    try {
      listener(ids);
    } catch (e) {
      console.error(e);
    }
  });
};

export const SavedStorage = {
  /**
   * Get all saved organization entries from persistent local storage
   */
  getSavedList: async (): Promise<SavedOrganizationEntry[]> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Seed initial default saved organizations matching UI reference
        const seeded: SavedOrganizationEntry[] = INITIAL_SAVED_IDS.map((id) => ({
          organizationId: id,
          savedAt: new Date().toISOString(),
        }));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
      }
      return JSON.parse(raw);
    } catch (err) {
      console.error("Error reading saved organizations:", err);
      return [];
    }
  },

  /**
   * Get list of saved organization IDs
   */
  getSavedIds: async (): Promise<string[]> => {
    const list = await SavedStorage.getSavedList();
    return list.map((item) => item.organizationId);
  },

  /**
   * Check if a specific organization is saved
   */
  isSaved: async (orgId: string): Promise<boolean> => {
    const ids = await SavedStorage.getSavedIds();
    return ids.includes(orgId);
  },

  /**
   * Toggle saved status (Save / Unsave)
   * Returns: true if now saved, false if removed
   */
  toggleSave: async (orgId: string): Promise<boolean> => {
    try {
      const list = await SavedStorage.getSavedList();
      const existingIndex = list.findIndex(
        (item) => item.organizationId === orgId
      );

      let updatedList: SavedOrganizationEntry[];
      let isNowSaved = false;

      if (existingIndex >= 0) {
        // Remove
        updatedList = list.filter((item) => item.organizationId !== orgId);
        isNowSaved = false;
      } else {
        // Add
        updatedList = [
          ...list,
          { organizationId: orgId, savedAt: new Date().toISOString() },
        ];
        isNowSaved = true;
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      notifyListeners(updatedList.map((item) => item.organizationId));
      return isNowSaved;
    } catch (err) {
      console.error("Error toggling save status:", err);
      return false;
    }
  },

  /**
   * Subscribe to changes for instant real-time sync across screens
   */
  subscribe: (listener: Listener): (() => void) => {
    listeners.add(listener);
    // Send current IDs immediately
    SavedStorage.getSavedIds().then(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export default SavedStorage;

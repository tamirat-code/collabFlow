import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWorkspaceStore = create(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      activeProjectId: null,
      setActiveWorkspace: (id) => set({ activeWorkspaceId: id, activeProjectId: null }),
      setActiveProject: (id) => set({ activeProjectId: id }),
    }),
    { name: 'workspace-storage' }
  )
);

export default useWorkspaceStore;
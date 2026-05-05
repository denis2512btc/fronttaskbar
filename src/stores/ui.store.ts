import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  createBoardDialogOpen: boolean
  openCreateBoardDialog: () => void
  setCreateBoardDialogOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  createBoardDialogOpen: false,
  openCreateBoardDialog: () => set({ createBoardDialogOpen: true }),
  setCreateBoardDialogOpen: (open) => set({ createBoardDialogOpen: open }),
}))

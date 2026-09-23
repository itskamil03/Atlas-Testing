import { create } from "zustand";

interface BookDemoState {
  isOpen: boolean;
  openDemoModal: () => void;
  closeDemoModal: () => void;
}

export const useBookDemoStore = create<BookDemoState>((set) => ({
  isOpen: false,
  openDemoModal: () => set({ isOpen: true }),
  closeDemoModal: () => set({ isOpen: false }),
}));

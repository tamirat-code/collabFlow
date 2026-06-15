import { create } from 'zustand';

const useToastStore = create((set, get) => ({
  toasts: [],
  addToast: (message) => {
    const id = Date.now();
    set({ toasts: [...get().toasts, { id, message }] });
    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) });
    }, 3000);
  },
}));

export default useToastStore;
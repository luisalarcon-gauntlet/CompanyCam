import { create } from 'zustand'

let toastId = 0

export const useToastStore = create((set) => ({
  toasts: [],
  add: (toast) => {
    const id = ++toastId
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }))
    return id
  },
  remove: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),
}))

export function toast(message, type = 'success') {
  useToastStore.getState().add({ message, type })
}

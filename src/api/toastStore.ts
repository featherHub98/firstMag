import { create } from "zustand";
import { toast as sonnerToast } from "sonner";

export type ToastType = "success" | "error" | "info";

interface ToastState {
  addToast: (message: string, type?: ToastType) => void;
}

export const useToastStore = create<ToastState>(() => ({
  addToast: (message, type = "info") => {
    if (type === "error") sonnerToast.error(message);
    else if (type === "success") sonnerToast.success(message);
    else sonnerToast(message);
  },
}));

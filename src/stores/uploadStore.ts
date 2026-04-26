import { create } from "zustand";
import type { UploadProgress } from "../api/upload";

interface UploadState {
  uploads: Map<string, UploadProgress>;
  isOpen: boolean;
  addUpload: (id: string, file: File) => void;
  updateProgress: (id: string, progress: number) => void;
  setStatus: (
    id: string,
    status: UploadProgress["status"],
    error?: string
  ) => void;
  removeUpload: (id: string) => void;
  clearCompleted: () => void;
  setOpen: (open: boolean) => void;
}

export const useUploadStore = create<UploadState>((set, get) => ({
  uploads: new Map(),
  isOpen: false,

  addUpload: (id, file) => {
    const uploads = new Map(get().uploads);
    uploads.set(id, { file, progress: 0, status: "pending" });
    set({ uploads, isOpen: true });
  },

  updateProgress: (id, progress) => {
    const uploads = new Map(get().uploads);
    const item = uploads.get(id);
    if (item) {
      uploads.set(id, { ...item, progress, status: "uploading" });
      set({ uploads });
    }
  },

  setStatus: (id, status, error) => {
    const uploads = new Map(get().uploads);
    const item = uploads.get(id);
    if (item) {
      uploads.set(id, { ...item, status, error });
      set({ uploads });
    }
  },

  removeUpload: (id) => {
    const uploads = new Map(get().uploads);
    uploads.delete(id);
    set({ uploads });
  },

  clearCompleted: () => {
    const uploads = new Map(get().uploads);
    for (const [id, item] of uploads) {
      if (item.status === "complete" || item.status === "error") {
        uploads.delete(id);
      }
    }
    set({ uploads });
  },

  setOpen: (isOpen) => set({ isOpen }),
}));

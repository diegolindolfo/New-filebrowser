import { create } from "zustand";
import type { FileItem, ViewMode, SortConfig } from "../types";

interface FileState {
  currentPath: string;
  items: FileItem[];
  selectedItems: Set<string>;
  viewMode: ViewMode;
  sorting: SortConfig;
  isLoading: boolean;
  clipboard: { items: FileItem[]; action: "copy" | "cut" } | null;

  setPath: (path: string) => void;
  setItems: (items: FileItem[]) => void;
  setViewMode: (mode: ViewMode) => void;
  setSorting: (sorting: SortConfig) => void;
  setLoading: (loading: boolean) => void;
  toggleSelect: (path: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setClipboard: (
    items: FileItem[],
    action: "copy" | "cut"
  ) => void;
  clearClipboard: () => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  currentPath: "/",
  items: [],
  selectedItems: new Set<string>(),
  viewMode: (localStorage.getItem("fb_viewMode") as ViewMode) || "grid",
  sorting: { by: "name", asc: true },
  isLoading: false,
  clipboard: null,

  setPath: (currentPath) =>
    set({ currentPath, selectedItems: new Set<string>() }),
  setItems: (items) => set({ items }),
  setViewMode: (viewMode) => {
    localStorage.setItem("fb_viewMode", viewMode);
    set({ viewMode });
  },
  setSorting: (sorting) => set({ sorting }),
  setLoading: (isLoading) => set({ isLoading }),
  toggleSelect: (path) => {
    const selected = new Set(get().selectedItems);
    if (selected.has(path)) selected.delete(path);
    else selected.add(path);
    set({ selectedItems: selected });
  },
  selectAll: () => {
    const selected = new Set(get().items.map((i) => i.path));
    set({ selectedItems: selected });
  },
  clearSelection: () => set({ selectedItems: new Set<string>() }),
  setClipboard: (items, action) => set({ clipboard: { items, action } }),
  clearClipboard: () => set({ clipboard: null }),
}));

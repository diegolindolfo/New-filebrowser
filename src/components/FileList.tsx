import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { useFileStore } from "../stores/fileStore";
import FileIcon from "./FileIcon";
import { formatSize, formatDate } from "../utils/format";
import type { FileItem } from "../types";

interface Props {
  items: FileItem[];
  onContextMenu: (e: React.MouseEvent, item: FileItem) => void;
  onPreview: (item: FileItem) => void;
}

export default function FileList({ items, onContextMenu, onPreview }: Props) {
  const navigate = useNavigate();
  const { selectedItems, toggleSelect } = useFileStore();

  const handleClick = (item: FileItem) => {
    if (selectedItems.size > 0) {
      toggleSelect(item.path);
      return;
    }
    if (item.isDir) {
      navigate(`/files${item.path}${item.path.endsWith("/") ? "" : "/"}`);
    } else {
      onPreview(item);
    }
  };

  return (
    <div className="divide-y divide-slate-800/50">
      {items.map((item) => {
        const selected = selectedItems.has(item.path);

        return (
          <button
            key={item.path}
            onClick={() => handleClick(item)}
            onContextMenu={(e) => onContextMenu(e, item)}
            onTouchStart={() => {
              const timer = setTimeout(() => toggleSelect(item.path), 500);
              const clear = () => clearTimeout(timer);
              document.addEventListener("touchend", clear, { once: true });
              document.addEventListener("touchmove", clear, { once: true });
            }}
            className={`group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
              selected
                ? "bg-blue-600/10"
                : "hover:bg-slate-800/40"
            }`}
          >
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                selected
                  ? "border-blue-500 bg-blue-600"
                  : "border-transparent group-hover:border-slate-600"
              }`}
            >
              {selected && <Check className="h-3 w-3 text-white" />}
            </div>

            <FileIcon item={item} className="h-5 w-5 shrink-0" />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-200">
                {item.name}
              </p>
            </div>

            <div className="hidden shrink-0 text-right sm:block">
              <p className="text-xs text-slate-500">
                {!item.isDir && formatSize(item.size)}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-xs text-slate-500">
                {formatDate(item.modified)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

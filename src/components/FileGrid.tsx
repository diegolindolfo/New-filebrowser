import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { useFileStore } from "../stores/fileStore";
import { previewUrl } from "../api/resources";
import FileIcon from "./FileIcon";
import { formatSize, formatDate, getFileIcon } from "../utils/format";
import type { FileItem } from "../types";

interface Props {
  items: FileItem[];
  onContextMenu: (e: React.MouseEvent, item: FileItem) => void;
  onPreview: (item: FileItem) => void;
}

export default function FileGrid({ items, onContextMenu, onPreview }: Props) {
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

  const handleLongPress = (item: FileItem) => {
    toggleSelect(item.path);
  };

  return (
    <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
      {items.map((item) => {
        const selected = selectedItems.has(item.path);
        const isImage = getFileIcon(item) === "image";

        return (
          <button
            key={item.path}
            onClick={() => handleClick(item)}
            onContextMenu={(e) => onContextMenu(e, item)}
            onTouchStart={() => {
              const timer = setTimeout(() => handleLongPress(item), 500);
              const clear = () => clearTimeout(timer);
              document.addEventListener("touchend", clear, { once: true });
              document.addEventListener("touchmove", clear, { once: true });
            }}
            className={`group relative flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-all ${
              selected
                ? "bg-blue-600/15 ring-1 ring-blue-500/50"
                : "hover:bg-slate-800/60"
            }`}
          >
            {/* Selection indicator */}
            <div
              className={`absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                selected
                  ? "border-blue-500 bg-blue-600"
                  : "border-slate-600 opacity-0 group-hover:opacity-100"
              }`}
            >
              {selected && <Check className="h-3 w-3 text-white" />}
            </div>

            {/* Thumbnail / Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-lg sm:h-20 sm:w-20">
              {isImage ? (
                <img
                  src={previewUrl(item.path, "thumb")}
                  alt={item.name}
                  className="h-full w-full rounded-lg object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (
                      e.target as HTMLImageElement
                    ).nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <div className={isImage ? "hidden" : ""}>
                <FileIcon item={item} className="h-10 w-10 sm:h-12 sm:w-12" />
              </div>
            </div>

            {/* Name */}
            <div className="w-full min-w-0">
              <p className="truncate text-xs font-medium text-slate-200 sm:text-sm">
                {item.name}
              </p>
              <p className="text-[10px] text-slate-500 sm:text-xs">
                {item.isDir ? formatDate(item.modified) : formatSize(item.size)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

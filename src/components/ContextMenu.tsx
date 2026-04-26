import { useEffect, useRef } from "react";
import {
  Download,
  Pencil,
  Copy,
  Scissors,
  Trash2,
  Share2,
  Info,
  FolderOpen,
  FileEdit,
} from "lucide-react";
import type { FileItem } from "../types";
import { useAuthStore } from "../stores/authStore";
import { isEditable } from "../utils/format";

interface Props {
  item: FileItem;
  position: { x: number; y: number };
  onClose: () => void;
  onAction: (action: string, item: FileItem) => void;
}

export default function ContextMenu({
  item,
  position,
  onClose,
  onAction,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const perms = user?.perm;

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [onClose]);

  const menuItems = [
    item.isDir && {
      icon: FolderOpen,
      label: "Abrir",
      action: "open",
    },
    !item.isDir &&
      isEditable(item.extension) && {
        icon: FileEdit,
        label: "Editar",
        action: "edit",
      },
    perms?.download && {
      icon: Download,
      label: "Baixar",
      action: "download",
    },
    perms?.rename && {
      icon: Pencil,
      label: "Renomear",
      action: "rename",
    },
    perms?.create && {
      icon: Copy,
      label: "Copiar",
      action: "copy",
    },
    perms?.rename && {
      icon: Scissors,
      label: "Recortar",
      action: "cut",
    },
    perms?.share && {
      icon: Share2,
      label: "Compartilhar",
      action: "share",
    },
    { icon: Info, label: "Detalhes", action: "info" },
    perms?.delete && {
      icon: Trash2,
      label: "Excluir",
      action: "delete",
      danger: true,
    },
  ].filter(Boolean) as {
    icon: React.ElementType;
    label: string;
    action: string;
    danger?: boolean;
  }[];

  const style: React.CSSProperties = {
    position: "fixed",
    left: Math.min(position.x, window.innerWidth - 200),
    top: Math.min(position.y, window.innerHeight - menuItems.length * 40 - 20),
    zIndex: 100,
  };

  return (
    <>
      <div className="fixed inset-0 z-[99]" onClick={onClose} />
      <div
        ref={ref}
        style={style}
        className="z-[100] w-48 rounded-xl border border-slate-700 bg-slate-800 py-1.5 shadow-xl animate-in fade-in zoom-in-95"
      >
        <div className="border-b border-slate-700 px-3 py-2">
          <p className="truncate text-xs font-medium text-slate-300">
            {item.name}
          </p>
        </div>
        {menuItems.map((mi) => (
          <button
            key={mi.action}
            onClick={() => {
              onAction(mi.action, item);
              onClose();
            }}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
              mi.danger
                ? "text-red-400 hover:bg-red-600/10"
                : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            <mi.icon className="h-4 w-4" />
            {mi.label}
          </button>
        ))}
      </div>
    </>
  );
}

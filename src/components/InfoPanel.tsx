import { X, Calendar, HardDrive, Hash, FileType } from "lucide-react";
import type { FileItem } from "../types";
import { formatSize, formatDate } from "../utils/format";
import FileIcon from "./FileIcon";

interface Props {
  item: FileItem;
  onClose: () => void;
}

export default function InfoPanel({ item, onClose }: Props) {
  const details = [
    { icon: FileType, label: "Tipo", value: item.isDir ? "Pasta" : item.extension || "Desconhecido" },
    { icon: HardDrive, label: "Tamanho", value: formatSize(item.size) },
    { icon: Calendar, label: "Modificado", value: new Date(item.modified).toLocaleString("pt-BR") },
    { icon: Hash, label: "Caminho", value: item.path },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-t-2xl sm:rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-100">Detalhes</h3>
          <button onClick={onClose} className="btn-icon">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4 flex items-center gap-3">
            <FileIcon item={item} className="h-10 w-10" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-100">
                {item.name}
              </p>
              <p className="text-xs text-slate-500">{formatDate(item.modified)}</p>
            </div>
          </div>

          <div className="space-y-3">
            {details.map((d) => (
              <div key={d.label} className="flex items-start gap-3">
                <d.icon className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{d.label}</p>
                  <p className="text-sm text-slate-200 break-all">{d.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  Download,
  Copy,
  Scissors,
  Trash2,
  X,
  ClipboardPaste,
  Share2,
  CheckSquare,
} from "lucide-react";
import { useFileStore } from "../stores/fileStore";
import { useAuthStore } from "../stores/authStore";

interface Props {
  onAction: (action: string) => void;
}

export default function ActionBar({ onAction }: Props) {
  const { selectedItems, clearSelection, clipboard } = useFileStore();
  const perms = useAuthStore((s) => s.user?.perm);
  const count = selectedItems.size;

  if (count === 0 && !clipboard) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 mx-3 md:bottom-3 md:left-auto md:right-3 md:mx-0">
      <div className="flex items-center gap-1 rounded-2xl border border-slate-700 bg-slate-800/95 px-3 py-2 shadow-2xl backdrop-blur-sm">
        {count > 0 && (
          <>
            <span className="mr-1 text-sm font-medium text-slate-300">
              {count} selecionado{count > 1 ? "s" : ""}
            </span>

            <button
              onClick={() => onAction("selectAll")}
              className="btn-icon"
              title="Selecionar todos"
            >
              <CheckSquare className="h-4 w-4" />
            </button>

            {perms?.download && (
              <button
                onClick={() => onAction("download")}
                className="btn-icon"
                title="Baixar"
              >
                <Download className="h-4 w-4" />
              </button>
            )}

            {perms?.create && (
              <button
                onClick={() => onAction("copy")}
                className="btn-icon"
                title="Copiar"
              >
                <Copy className="h-4 w-4" />
              </button>
            )}

            {perms?.rename && (
              <button
                onClick={() => onAction("cut")}
                className="btn-icon"
                title="Recortar"
              >
                <Scissors className="h-4 w-4" />
              </button>
            )}

            {perms?.share && (
              <button
                onClick={() => onAction("share")}
                className="btn-icon"
                title="Compartilhar"
              >
                <Share2 className="h-4 w-4" />
              </button>
            )}

            {perms?.delete && (
              <button
                onClick={() => onAction("delete")}
                className="btn-icon text-red-400 hover:text-red-300"
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={clearSelection}
              className="btn-icon"
              title="Limpar seleção"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        )}

        {clipboard && count === 0 && (
          <>
            <span className="mr-1 text-sm text-slate-400">
              {clipboard.items.length} na área de transferência
            </span>
            <button
              onClick={() => onAction("paste")}
              className="btn-icon text-blue-400"
              title="Colar aqui"
            >
              <ClipboardPaste className="h-4 w-4" />
            </button>
            <button
              onClick={() => onAction("clearClipboard")}
              className="btn-icon"
              title="Limpar"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { X, FolderPlus, FilePlus } from "lucide-react";

interface Props {
  onClose: () => void;
  onCreate: (name: string, isDir: boolean) => void;
}

export default function NewItemDialog({ onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [isDir, setIsDir] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), isDir);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-t-2xl sm:rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-100">Novo item</h3>
          <button onClick={onClose} className="btn-icon">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsDir(true)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg p-3 text-sm font-medium transition-colors ${
                isDir
                  ? "bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/50"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-700"
              }`}
            >
              <FolderPlus className="h-4 w-4" />
              Pasta
            </button>
            <button
              type="button"
              onClick={() => setIsDir(false)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg p-3 text-sm font-medium transition-colors ${
                !isDir
                  ? "bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/50"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-700"
              }`}
            >
              <FilePlus className="h-4 w-4" />
              Arquivo
            </button>
          </div>

          <input
            ref={inputRef}
            type="text"
            placeholder={isDir ? "Nome da pasta" : "Nome do arquivo"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn btn-primary"
            >
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

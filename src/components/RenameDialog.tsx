import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface Props {
  currentName: string;
  onRename: (newName: string) => void;
  onClose: () => void;
}

export default function RenameDialog({ currentName, onRename, onClose }: Props) {
  const [name, setName] = useState(currentName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const dotIndex = currentName.lastIndexOf(".");
    if (dotIndex > 0) {
      inputRef.current?.setSelectionRange(0, dotIndex);
    } else {
      inputRef.current?.select();
    }
  }, [currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && name !== currentName) {
      onRename(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-t-2xl sm:rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-100">Renomear</h3>
          <button onClick={onClose} className="btn-icon">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <input
            ref={inputRef}
            type="text"
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
              disabled={!name.trim() || name === currentName}
              className="btn btn-primary"
            >
              Renomear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

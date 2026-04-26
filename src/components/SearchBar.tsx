import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Folder, File } from "lucide-react";
import { searchFiles } from "../api/resources";
import type { FileItem } from "../types";

interface Props {
  onClose: () => void;
}

export default function SearchBar({ onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      debounceRef.current = setTimeout(() => setResults([]), 0);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchFiles(query);
        setResults(res.slice(0, 20));
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300);
  }, [query]);

  const handleSelect = (item: FileItem) => {
    if (item.isDir) {
      navigate(`/files${item.path}`);
    } else {
      const dir = item.path.substring(0, item.path.lastIndexOf("/") + 1);
      navigate(`/files${dir}`);
    }
    onClose();
  };

  return (
    <>
      <Search className="h-4 w-4 shrink-0 text-slate-500" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Buscar arquivos..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        className="flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
      />
      <button onClick={onClose} className="btn-icon shrink-0">
        <X className="h-4 w-4" />
      </button>

      {(results.length > 0 || loading) && (
        <div className="absolute left-0 right-0 top-14 z-50 max-h-80 overflow-auto rounded-b-xl border-x border-b border-slate-700 bg-slate-900 shadow-xl md:left-auto md:right-0 md:w-full md:rounded-xl md:border md:top-12">
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
              Buscando...
            </div>
          )}
          {results.map((item) => (
            <button
              key={item.path}
              onClick={() => handleSelect(item)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-800 transition-colors"
            >
              {item.isDir ? (
                <Folder className="h-4 w-4 shrink-0 text-blue-400" />
              ) : (
                <File className="h-4 w-4 shrink-0 text-slate-400" />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm text-slate-200">{item.name}</p>
                <p className="truncate text-xs text-slate-500">{item.path}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

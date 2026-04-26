import { useState } from "react";
import { X, Copy, Link, Check, Trash2 } from "lucide-react";
import { createShare, deleteShare, getSharesForPath } from "../api/shares";
import type { Share, FileItem } from "../types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Props {
  item: FileItem;
  onClose: () => void;
}

export default function ShareDialog({ item, onClose }: Props) {
  const [expires, setExpires] = useState("");
  const [password, setPassword] = useState("");
  const [unit, setUnit] = useState("hours");
  const [copied, setCopied] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: shares = [], isLoading } = useQuery({
    queryKey: ["shares", item.path],
    queryFn: () => getSharesForPath(item.path),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createShare(item.path, expires || undefined, password || undefined, unit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shares", item.path] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (hash: string) => deleteShare(hash),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shares", item.path] });
    },
  });

  const getShareUrl = (share: Share) => {
    const base = window.location.origin;
    return `${base}/api/public/dl/${share.hash}${item.path}`;
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Compartilhar
            </h3>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          <p className="mb-3 truncate text-sm text-slate-400">{item.name}</p>

          {/* Create new share */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Expira em..."
                value={expires}
                onChange={(e) => setExpires(e.target.value)}
                className="input flex-1"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="input w-28"
              >
                <option value="hours">Horas</option>
                <option value="days">Dias</option>
                <option value="minutes">Minutos</option>
              </select>
            </div>

            <input
              type="password"
              placeholder="Senha (opcional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />

            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="btn btn-primary w-full"
            >
              {createMutation.isPending ? "Criando..." : "Criar link"}
            </button>
          </div>

          {/* Existing shares */}
          {isLoading ? (
            <div className="mt-4 flex justify-center py-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
            </div>
          ) : shares.length > 0 ? (
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-medium text-slate-500 uppercase">
                Links ativos
              </h4>
              {shares.map((share) => (
                <div
                  key={share.hash}
                  className="flex items-center gap-2 rounded-lg bg-slate-900 p-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-mono text-slate-400">
                      {share.hash}
                    </p>
                    {share.expire > 0 && (
                      <p className="text-[10px] text-slate-600">
                        Expira: {new Date(share.expire * 1000).toLocaleString("pt-BR")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(getShareUrl(share), share.hash)
                    }
                    className="btn-icon shrink-0"
                    title="Copiar link"
                  >
                    {copied === share.hash ? (
                      <Check className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(share.hash)}
                    className="btn-icon shrink-0 text-red-400"
                    title="Excluir"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

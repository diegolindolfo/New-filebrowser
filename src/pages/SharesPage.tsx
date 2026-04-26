import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Share2, Trash2, Copy, Check, ExternalLink } from "lucide-react";
import { listShares, deleteShare } from "../api/shares";
import { useState } from "react";

export default function SharesPage() {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState<string | null>(null);

  const { data: shares = [], isLoading } = useQuery({
    queryKey: ["allShares"],
    queryFn: listShares,
  });

  const deleteMutation = useMutation({
    mutationFn: (hash: string) => deleteShare(hash),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allShares"] }),
  });

  const getShareUrl = (hash: string, path: string) => {
    return `${window.location.origin}/api/public/dl/${hash}${path}`;
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10">
          <Share2 className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-100">
            Compartilhamentos
          </h1>
          <p className="text-sm text-slate-500">
            {shares.length} link{shares.length !== 1 ? "s" : ""} ativo
            {shares.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
        </div>
      ) : shares.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
          <Share2 className="h-10 w-10 text-slate-700" />
          <p className="text-sm text-slate-500">
            Nenhum link de compartilhamento
          </p>
          <p className="text-xs text-slate-600">
            Compartilhe arquivos usando o menu de contexto nos arquivos
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {shares.map((share) => (
            <div
              key={share.hash}
              className="card flex items-center gap-3 p-4"
            >
              <ExternalLink className="h-4 w-4 shrink-0 text-blue-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-200">
                  {share.path}
                </p>
                <p className="text-xs font-mono text-slate-500">
                  {share.hash}
                </p>
                {share.expire > 0 && (
                  <p className="text-[10px] text-slate-600">
                    Expira:{" "}
                    {new Date(share.expire * 1000).toLocaleString("pt-BR")}
                  </p>
                )}
              </div>

              <button
                onClick={() =>
                  copyToClipboard(getShareUrl(share.hash, share.path), share.hash)
                }
                className="btn-icon shrink-0"
                title="Copiar link"
              >
                {copied === share.hash ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>

              <button
                onClick={() => {
                  if (confirm("Excluir este link?")) {
                    deleteMutation.mutate(share.hash);
                  }
                }}
                className="btn-icon shrink-0 text-red-400"
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Save } from "lucide-react";
import { getSettings, updateSettings } from "../api/settings";
import type { Settings as SettingsType } from "../types";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [editedSettings, setEditedSettings] = useState<Partial<SettingsType>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: () => updateSettings({ ...settings, ...editedSettings }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setEditedSettings({});
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
      </div>
    );
  }

  if (!settings) return null;

  const current = { ...settings, ...editedSettings };
  const hasChanges = Object.keys(editedSettings).length > 0;

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10">
          <Settings className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-100">
            Configurações
          </h1>
          <p className="text-sm text-slate-500">
            Configurações globais do FileBrowser
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* General */}
        <section className="card p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-300">Geral</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Permitir cadastro de usuários
              </span>
              <input
                type="checkbox"
                checked={current.signup}
                onChange={(e) =>
                  setEditedSettings((s) => ({ ...s, signup: e.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Criar diretório do usuário
              </span>
              <input
                type="checkbox"
                checked={current.createUserDir}
                onChange={(e) =>
                  setEditedSettings((s) => ({
                    ...s,
                    createUserDir: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600"
              />
            </label>

            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Tamanho mínimo da senha
              </label>
              <input
                type="number"
                value={current.minimumPasswordLength}
                onChange={(e) =>
                  setEditedSettings((s) => ({
                    ...s,
                    minimumPasswordLength: Number(e.target.value),
                  }))
                }
                className="input w-24"
                min={1}
              />
            </div>
          </div>
        </section>

        {/* Branding */}
        <section className="card p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-300">
            Personalização
          </h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Nome da instância
              </label>
              <input
                type="text"
                placeholder="File Browser"
                value={current.branding?.name || ""}
                onChange={(e) =>
                  setEditedSettings((s) => ({
                    ...s,
                    branding: { ...current.branding, name: e.target.value },
                  }))
                }
                className="input"
              />
            </div>

            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Desabilitar links externos
              </span>
              <input
                type="checkbox"
                checked={current.branding?.disableExternal}
                onChange={(e) =>
                  setEditedSettings((s) => ({
                    ...s,
                    branding: {
                      ...current.branding,
                      disableExternal: e.target.checked,
                    },
                  }))
                }
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600"
              />
            </label>
          </div>
        </section>

        {/* Auth */}
        <section className="card p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-300">
            Autenticação
          </h2>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Método</label>
            <select
              value={current.authMethod}
              onChange={(e) =>
                setEditedSettings((s) => ({
                  ...s,
                  authMethod: e.target.value,
                }))
              }
              className="input w-48"
            >
              <option value="password">Senha</option>
              <option value="noauth">Sem autenticação</option>
              <option value="proxy">Proxy</option>
            </select>
          </div>
        </section>

        {hasChanges && (
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="btn btn-primary w-full"
          >
            {mutation.isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar alterações
          </button>
        )}
      </div>
    </div>
  );
}

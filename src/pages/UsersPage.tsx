import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Trash2, Shield, X } from "lucide-react";
import { listUsers, createUser, deleteUser } from "../api/users";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-100">Usuários</h1>
            <p className="text-sm text-slate-500">
              {users.length} usuário{users.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowNew(true)}
          className="btn btn-primary text-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="card flex items-center gap-3 p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/10 text-sm font-semibold text-blue-400">
                {user.username[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-200">
                    {user.username}
                  </p>
                  {user.perm.admin && (
                    <Shield className="h-3.5 w-3.5 text-amber-400" />
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Escopo: {user.scope}
                </p>
              </div>

              {user.id !== 1 && (
                <button
                  onClick={() => {
                    if (confirm(`Excluir "${user.username}"?`)) {
                      deleteMutation.mutate(user.id);
                    }
                  }}
                  className="btn-icon text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <NewUserDialog
          onClose={() => setShowNew(false)}
          onCreated={() => {
            setShowNew(false);
            queryClient.invalidateQueries({ queryKey: ["users"] });
          }}
        />
      )}
    </div>
  );
}

function NewUserDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [scope, setScope] = useState(".");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      createUser({
        username,
        password,
        scope,
        perm: {
          admin: isAdmin,
          execute: true,
          create: true,
          rename: true,
          modify: true,
          delete: true,
          share: true,
          download: true,
        },
      }),
    onSuccess: onCreated,
    onError: (err) => setError((err as Error).message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-t-2xl sm:rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-100">
            Novo usuário
          </h3>
          <button onClick={onClose} className="btn-icon">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-3 p-4"
        >
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <input
            type="text"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
            required
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
          />

          <input
            type="text"
            placeholder="Escopo (ex: .)"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="input"
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600"
            />
            <span className="text-sm text-slate-400">Administrador</span>
          </label>

          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn btn-primary"
            >
              {mutation.isPending ? "Criando..." : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

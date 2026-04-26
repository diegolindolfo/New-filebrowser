import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  FolderOpen,
  Settings,
  Users,
  Share2,
  Menu,
  X,
  Upload,
  Search,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useUploadStore } from "../stores/uploadStore";
import SearchBar from "./SearchBar";
import UploadPanel from "./UploadPanel";

const NAV_ITEMS = [
  { path: "/files/", icon: FolderOpen, label: "Arquivos" },
  { path: "/shares", icon: Share2, label: "Compartilhamentos" },
  { path: "/users", icon: Users, label: "Usuários", adminOnly: true },
  { path: "/settings", icon: Settings, label: "Configurações", adminOnly: true },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const uploadStore = useUploadStore();

  const isAdmin = user?.perm.admin ?? false;
  const filteredNav = NAV_ITEMS.filter((i) => !i.adminOnly || isAdmin);

  return (
    <div className="flex h-dvh flex-col bg-slate-950">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-800 bg-slate-900/80 px-3 backdrop-blur-sm md:px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn-icon md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={() => navigate("/files/")}
          className="flex items-center gap-2 text-base font-semibold text-slate-100"
        >
          <FolderOpen className="h-5 w-5 text-blue-400" />
          <span className="hidden sm:inline">FileBrowser</span>
        </button>

        <div className="flex-1" />

        {searchOpen ? (
          <div className="absolute inset-x-0 top-0 z-50 flex h-14 items-center gap-2 bg-slate-900 px-3 md:relative md:inset-auto md:max-w-md md:flex-1 md:bg-transparent md:px-0">
            <SearchBar onClose={() => setSearchOpen(false)} />
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="btn-icon"
          >
            <Search className="h-5 w-5" />
          </button>
        )}

        <button
          onClick={() => uploadStore.setOpen(!uploadStore.isOpen)}
          className="btn-icon relative"
        >
          <Upload className="h-5 w-5" />
          {uploadStore.uploads.size > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {uploadStore.uploads.size}
            </span>
          )}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-900 border-r border-slate-800 transition-transform duration-200 md:relative md:z-auto md:w-56 md:translate-x-0 md:shrink-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-14 items-center justify-between px-4 md:hidden">
            <span className="text-base font-semibold text-slate-100">Menu</span>
            <button onClick={() => setSidebarOpen(false)} className="btn-icon">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-1 p-2 pt-0 md:pt-2">
            {filteredNav.map((item) => {
              const active = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-600/10 text-blue-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <item.icon className="h-4.5 w-4.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {user && (
            <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/20 text-sm font-semibold text-blue-400">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {user.username}
                  </p>
                  <p className="text-xs text-slate-500">
                    {isAdmin ? "Admin" : "Usuário"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Upload panel */}
      <UploadPanel />

      {/* Bottom nav (mobile only) */}
      <nav className="flex shrink-0 items-center justify-around border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm md:hidden safe-bottom">
        {filteredNav.slice(0, 4).map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 text-[11px] font-medium transition-colors ${
                active ? "text-blue-400" : "text-slate-500"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

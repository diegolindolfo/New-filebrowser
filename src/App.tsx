import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { loginNoAuth, login, getToken, renewToken } from "./api/client";
import { getUser } from "./api/users";
import Layout from "./components/Layout";
import FileBrowser from "./pages/FileBrowser";
import LoginPage from "./pages/LoginPage";
import EditorPage from "./pages/EditorPage";
import SettingsPage from "./pages/SettingsPage";
import UsersPage from "./pages/UsersPage";
import SharesPage from "./pages/SharesPage";

export default function App() {
  const { isAuthenticated, setUser, setNoAuth, setAuthenticated } =
    useAuthStore();
  const [loading, setLoading] = useState(true);
  const [authMethod, setAuthMethod] = useState<string>("password");

  useEffect(() => {
    const init = async () => {
      try {
        const existingToken = getToken();
        if (existingToken) {
          try {
            await renewToken();
            const user = await getUser(1);
            setUser(user);
            setLoading(false);
            return;
          } catch {
            // token expired, continue to login
          }
        }

        // Try noauth login first (works when server has NoAuth enabled)
        try {
          await loginNoAuth();
          const user = await getUser(1);
          setUser(user);
          setNoAuth(true);
          setAuthMethod("noauth");
          setLoading(false);
          return;
        } catch {
          // noauth not available, show login page
        }

        setAuthMethod("password");
      } catch (err) {
        console.error("Init failed:", err);
      }
      setLoading(false);
    };
    init();
  }, [setUser, setNoAuth, setAuthenticated]);

  const handleLogin = async (username: string, password: string) => {
    await login(username, password);
    const user = await getUser(1);
    setUser(user);
  };

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
          <span className="text-sm text-slate-400">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && authMethod !== "noauth") {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/files/" replace />} />
        <Route path="/files/*" element={<FileBrowser />} />
        <Route path="/editor/*" element={<EditorPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/shares" element={<SharesPage />} />
        <Route path="*" element={<Navigate to="/files/" replace />} />
      </Route>
    </Routes>
  );
}

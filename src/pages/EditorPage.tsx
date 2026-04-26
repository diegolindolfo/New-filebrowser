import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Save, ArrowLeft, FileCode } from "lucide-react";
import { rawDownloadUrl, updateResource } from "../api/resources";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import { oneDark } from "@codemirror/theme-one-dark";
import { getLanguage } from "../utils/format";

function getExtension(ext: string) {
  const lang = getLanguage(ext);
  const map: Record<string, () => ReturnType<typeof javascript>> = {
    javascript,
    html,
    css,
    json,
    markdown,
    python,
    xml,
    yaml,
  };
  return map[lang]?.() || [];
}

export default function EditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = decodeURIComponent(
    location.pathname.replace("/editor", "") || "/"
  );
  const name = path.split("/").pop() || "";
  const ext = name.includes(".") ? name.split(".").pop() || "" : "";

  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [modified, setModified] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(rawDownloadUrl(path));
        const text = await res.text();

        if (editorRef.current) {
          if (viewRef.current) viewRef.current.destroy();

          const state = EditorState.create({
            doc: text,
            extensions: [
              basicSetup,
              oneDark,
              getExtension(ext),
              EditorView.updateListener.of((update) => {
                if (update.docChanged) setModified(true);
              }),
              EditorView.theme({
                "&": {
                  height: "100%",
                  fontSize: "13px",
                },
                ".cm-scroller": {
                  overflow: "auto",
                },
              }),
            ],
          });

          viewRef.current = new EditorView({
            state,
            parent: editorRef.current,
          });
        }
      } catch (err) {
        console.error("Failed to load file:", err);
      }
      setLoading(false);
    };
    load();

    return () => {
      viewRef.current?.destroy();
    };
  }, [path, ext]);

  const handleSave = useCallback(async () => {
    if (!viewRef.current) return;
    setSaving(true);
    try {
      const content = viewRef.current.state.doc.toString();
      await updateResource(path, content);
      setModified(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert("Erro ao salvar: " + (err as Error).message);
    }
    setSaving(false);
  }, [path]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-slate-800 px-3 py-2">
        <button onClick={() => navigate(-1)} className="btn-icon">
          <ArrowLeft className="h-4 w-4" />
        </button>

        <FileCode className="h-4 w-4 text-slate-500" />
        <span className="min-w-0 flex-1 truncate text-sm text-slate-300">
          {name}
        </span>

        {modified && (
          <span className="text-xs text-amber-400">modificado</span>
        )}
        {saved && <span className="text-xs text-green-400">salvo</span>}

        <button
          onClick={handleSave}
          disabled={saving || !modified}
          className="btn btn-primary py-1.5 text-xs"
        >
          {saving ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Salvar
        </button>
      </div>

      <div ref={editorRef} className="flex-1 overflow-hidden">
        {loading && (
          <div className="flex h-64 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
          </div>
        )}
      </div>
    </div>
  );
}

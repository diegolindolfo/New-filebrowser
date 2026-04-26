import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutGrid,
  List,
  ArrowUpDown,
  Plus,
  RefreshCw,
  Upload,
} from "lucide-react";
import { useFileStore } from "../stores/fileStore";
import { useUploadStore } from "../stores/uploadStore";
import {
  getResource,
  deleteResource,
  patchResource,
  createResource,
  rawDownloadUrl,
  rawDownloadMultiUrl,
} from "../api/resources";
import { simpleUpload } from "../api/upload";
import { sortItems } from "../utils/sort";
import Breadcrumbs from "../components/Breadcrumbs";
import FileGrid from "../components/FileGrid";
import FileList from "../components/FileList";
import ActionBar from "../components/ActionBar";
import ContextMenu from "../components/ContextMenu";
import PreviewModal from "../components/PreviewModal";
import ShareDialog from "../components/ShareDialog";
import RenameDialog from "../components/RenameDialog";
import NewItemDialog from "../components/NewItemDialog";
import InfoPanel from "../components/InfoPanel";
import type { FileItem } from "../types";

export default function FileBrowser() {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useFileStore();
  const uploadStore = useUploadStore();

  const rawPath =
    "/" + (location.pathname.replace("/files", "").replace(/^\/+/, "") || "");
  const currentPath = rawPath.endsWith("/") ? rawPath : `${rawPath}/`;

  const [contextMenu, setContextMenu] = useState<{
    item: FileItem;
    position: { x: number; y: number };
  } | null>(null);
  const [previewItem, setPreviewItem] = useState<FileItem | null>(null);
  const [shareItem, setShareItem] = useState<FileItem | null>(null);
  const [renameItem, setRenameItem] = useState<FileItem | null>(null);
  const [showNewItem, setShowNewItem] = useState(false);
  const [infoItem, setInfoItem] = useState<FileItem | null>(null);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["resources", currentPath],
    queryFn: async () => {
      const res = await getResource(currentPath);
      store.setItems(res.items || []);
      store.setPath(currentPath);
      return res;
    },
  });

  const items = sortItems(data?.items || [], store.sorting);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, item: FileItem) => {
      e.preventDefault();
      setContextMenu({ item, position: { x: e.clientX, y: e.clientY } });
    },
    []
  );

  const handleContextAction = useCallback(
    async (action: string, item: FileItem) => {
      switch (action) {
        case "open":
          navigate(
            `/files${item.path}${item.path.endsWith("/") ? "" : "/"}`
          );
          break;
        case "edit":
          navigate(`/editor${item.path}`);
          break;
        case "download": {
          const a = document.createElement("a");
          a.href = rawDownloadUrl(item.path);
          a.download = item.name;
          a.click();
          break;
        }
        case "rename":
          setRenameItem(item);
          break;
        case "copy":
          store.setClipboard([item], "copy");
          break;
        case "cut":
          store.setClipboard([item], "cut");
          break;
        case "share":
          setShareItem(item);
          break;
        case "info":
          setInfoItem(item);
          break;
        case "delete":
          if (confirm(`Excluir "${item.name}"?`)) {
            await deleteResource(item.path);
            refetch();
          }
          break;
      }
    },
    [navigate, store, refetch]
  );

  const handleActionBar = useCallback(
    async (action: string) => {
      const selectedPaths = Array.from(store.selectedItems);
      const selectedFiles = items.filter((i) => selectedPaths.includes(i.path));

      switch (action) {
        case "selectAll":
          store.selectAll();
          break;
        case "download":
          if (selectedPaths.length === 1) {
            const a = document.createElement("a");
            a.href = rawDownloadUrl(selectedPaths[0]);
            a.download = "";
            a.click();
          } else {
            const a = document.createElement("a");
            a.href = rawDownloadMultiUrl(selectedPaths);
            a.download = "download.zip";
            a.click();
          }
          store.clearSelection();
          break;
        case "copy":
          store.setClipboard(selectedFiles, "copy");
          store.clearSelection();
          break;
        case "cut":
          store.setClipboard(selectedFiles, "cut");
          store.clearSelection();
          break;
        case "share":
          if (selectedFiles.length === 1) setShareItem(selectedFiles[0]);
          break;
        case "delete":
          if (
            confirm(
              `Excluir ${selectedPaths.length} item(s)?`
            )
          ) {
            for (const path of selectedPaths) {
              await deleteResource(path);
            }
            store.clearSelection();
            refetch();
          }
          break;
        case "paste": {
          const clip = store.clipboard;
          if (!clip) break;
          try {
            for (const item of clip.items) {
              await patchResource(item.path, {
                action: clip.action === "cut" ? "rename" : "copy",
                destination: `${currentPath}${item.name}`,
                override: false,
                rename: true,
              });
            }
            store.clearClipboard();
            refetch();
          } catch (e) {
            alert(`Erro ao colar: ${e instanceof Error ? e.message : e}`);
          }
          break;
        }
        case "clearClipboard":
          store.clearClipboard();
          break;
      }
    },
    [store, items, currentPath, refetch]
  );

  const handleRename = useCallback(
    async (newName: string) => {
      if (!renameItem) return;
      try {
        const dir = renameItem.path.substring(
          0,
          renameItem.path.lastIndexOf("/") + 1
        );
        await patchResource(renameItem.path, {
          action: "rename",
          destination: `${dir}${newName}`,
          override: false,
          rename: false,
        });
        setRenameItem(null);
        refetch();
      } catch (e) {
        alert(`Erro ao renomear: ${e instanceof Error ? e.message : e}`);
      }
    },
    [renameItem, refetch]
  );

  const handleCreate = useCallback(
    async (name: string, isDir: boolean) => {
      const path = `${currentPath}${name}${isDir ? "/" : ""}`;
      await createResource(path, isDir);
      setShowNewItem(false);
      refetch();
    },
    [currentPath, refetch]
  );

  const handleUploadClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = () => {
      if (!input.files) return;
      const files = Array.from(input.files);
      for (const file of files) {
        const id = `${Date.now()}-${file.name}`;
        uploadStore.addUpload(id, file);
        simpleUpload(file, currentPath, (p) =>
          uploadStore.updateProgress(id, p)
        )
          .then(() => {
            uploadStore.setStatus(id, "complete");
            refetch();
          })
          .catch((err) => uploadStore.setStatus(id, "error", err.message));
      }
    };
    input.click();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-slate-800 px-3 py-2">
        <div className="min-w-0 flex-1">
          <Breadcrumbs path={currentPath} />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={handleUploadClick}
            className="btn-icon"
            title="Upload"
          >
            <Upload className="h-4 w-4" />
          </button>

          <button
            onClick={() => setShowNewItem(true)}
            className="btn-icon"
            title="Novo"
          >
            <Plus className="h-4 w-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setSortMenuOpen(!sortMenuOpen)}
              className="btn-icon"
              title="Ordenar"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
            {sortMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setSortMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-slate-700 bg-slate-800 py-1 shadow-xl">
                  {[
                    { by: "name", label: "Nome" },
                    { by: "size", label: "Tamanho" },
                    { by: "modified", label: "Data" },
                  ].map((opt) => (
                    <button
                      key={opt.by}
                      onClick={() => {
                        store.setSorting({
                          by: opt.by,
                          asc:
                            store.sorting.by === opt.by
                              ? !store.sorting.asc
                              : true,
                        });
                        setSortMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-slate-700 ${
                        store.sorting.by === opt.by
                          ? "text-blue-400"
                          : "text-slate-300"
                      }`}
                    >
                      {opt.label}
                      {store.sorting.by === opt.by && (
                        <span className="text-xs">
                          {store.sorting.asc ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() =>
              store.setViewMode(
                store.viewMode === "grid" ? "list" : "grid"
              )
            }
            className="btn-icon"
            title="Alternar visualização"
          >
            {store.viewMode === "grid" ? (
              <List className="h-4 w-4" />
            ) : (
              <LayoutGrid className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={() => refetch()}
            className="btn-icon"
            title="Atualizar"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading && !data ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2">
            <p className="text-sm text-red-400">Erro ao carregar</p>
            <button onClick={() => refetch()} className="btn btn-secondary text-xs">
              Tentar novamente
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <div className="text-4xl opacity-30">📁</div>
            <p className="text-sm text-slate-500">Pasta vazia</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewItem(true)}
                className="btn btn-secondary text-xs"
              >
                <Plus className="h-3 w-3" /> Criar item
              </button>
              <button
                onClick={handleUploadClick}
                className="btn btn-primary text-xs"
              >
                <Upload className="h-3 w-3" /> Upload
              </button>
            </div>
          </div>
        ) : store.viewMode === "grid" ? (
          <FileGrid
            items={items}
            onContextMenu={handleContextMenu}
            onPreview={setPreviewItem}
          />
        ) : (
          <FileList
            items={items}
            onContextMenu={handleContextMenu}
            onPreview={setPreviewItem}
          />
        )}
      </div>

      {/* Action bar */}
      <ActionBar onAction={handleActionBar} />

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          item={contextMenu.item}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onAction={handleContextAction}
        />
      )}

      {/* Preview */}
      {previewItem && (
        <PreviewModal
          item={previewItem}
          items={items}
          onClose={() => setPreviewItem(null)}
          onEdit={(item) => {
            setPreviewItem(null);
            navigate(`/editor${item.path}`);
          }}
          onShare={(item) => {
            setPreviewItem(null);
            setShareItem(item);
          }}
          onDownload={(item) => {
            const a = document.createElement("a");
            a.href = rawDownloadUrl(item.path);
            a.download = item.name;
            a.click();
          }}
        />
      )}

      {/* Share dialog */}
      {shareItem && (
        <ShareDialog item={shareItem} onClose={() => setShareItem(null)} />
      )}

      {/* Rename dialog */}
      {renameItem && (
        <RenameDialog
          currentName={renameItem.name}
          onRename={handleRename}
          onClose={() => setRenameItem(null)}
        />
      )}

      {/* New item dialog */}
      {showNewItem && (
        <NewItemDialog
          onClose={() => setShowNewItem(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Info panel */}
      {infoItem && (
        <InfoPanel item={infoItem} onClose={() => setInfoItem(null)} />
      )}
    </div>
  );
}

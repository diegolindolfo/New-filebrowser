import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useUploadStore } from "../stores/uploadStore";
import { useFileStore } from "../stores/fileStore";
import { simpleUpload } from "../api/upload";
import { formatSize } from "../utils/format";

export default function UploadPanel() {
  const store = useUploadStore();
  const currentPath = useFileStore((s) => s.currentPath);

  const startUpload = useCallback(
    (files: File[]) => {
      for (const file of files) {
        const id = `${Date.now()}-${file.name}`;
        store.addUpload(id, file);

        simpleUpload(
          file,
          currentPath,
          (progress) => store.updateProgress(id, progress)
        )
          .then(() => store.setStatus(id, "complete"))
          .catch((err) =>
            store.setStatus(id, "error", err.message)
          );
      }
    },
    [currentPath, store]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: startUpload,
    noClick: true,
    noKeyboard: true,
  });

  const uploads = Array.from(store.uploads.entries());
  const hasActive = uploads.some(
    ([, u]) => u.status === "uploading" || u.status === "pending"
  );

  if (!store.isOpen && uploads.length === 0) {
    return (
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-600/20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-slate-800 p-8 shadow-2xl">
              <Upload className="h-12 w-12 text-blue-400" />
              <p className="text-lg font-medium text-slate-100">
                Solte para enviar
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />

      {isDragActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-600/20 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-slate-800 p-8 shadow-2xl">
            <Upload className="h-12 w-12 text-blue-400" />
            <p className="text-lg font-medium text-slate-100">
              Solte para enviar
            </p>
          </div>
        </div>
      )}

      {store.isOpen && (
        <div className="fixed bottom-16 right-3 z-40 w-80 md:bottom-3">
          <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-slate-200">
                  Uploads {hasActive && `(${uploads.length})`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={open}
                  className="btn-icon text-blue-400"
                  title="Adicionar arquivos"
                >
                  <Upload className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={store.clearCompleted}
                  className="btn-icon"
                  title="Limpar concluídos"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => store.setOpen(false)}
                  className="btn-icon"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="max-h-60 overflow-auto">
              {uploads.length === 0 ? (
                <div className="p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-slate-600" />
                  <p className="mt-2 text-sm text-slate-500">
                    Arraste arquivos ou clique em +
                  </p>
                </div>
              ) : (
                uploads.map(([id, upload]) => (
                  <div
                    key={id}
                    className="flex items-center gap-3 border-b border-slate-700/50 px-4 py-2.5 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-slate-300">
                        {upload.file.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {formatSize(upload.file.size)}
                      </p>
                    </div>

                    {upload.status === "uploading" && (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-700">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{ width: `${upload.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {upload.progress}%
                        </span>
                      </div>
                    )}

                    {upload.status === "complete" && (
                      <CheckCircle className="h-4 w-4 shrink-0 text-green-400" />
                    )}

                    {upload.status === "error" && (
                      <span title={upload.error}>
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                      </span>
                    )}

                    {upload.status === "pending" && (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
                    )}

                    <button
                      onClick={() => store.removeUpload(id)}
                      className="btn-icon shrink-0 p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

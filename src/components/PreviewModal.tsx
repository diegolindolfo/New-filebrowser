import { useState, useEffect } from "react";
import { X, Download, Share2, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import type { FileItem } from "../types";
import { rawDownloadUrl, previewUrl } from "../api/resources";
import { getFileIcon, isEditable, formatSize, formatDate } from "../utils/format";

interface Props {
  item: FileItem;
  items: FileItem[];
  onClose: () => void;
  onEdit: (item: FileItem) => void;
  onShare: (item: FileItem) => void;
  onDownload: (item: FileItem) => void;
}

export default function PreviewModal({
  item: initialItem,
  items,
  onClose,
  onEdit,
  onShare,
  onDownload,
}: Props) {
  const [currentItem, setCurrentItem] = useState(initialItem);
  const fileItems = items.filter((i) => !i.isDir);
  const currentIndex = fileItems.findIndex((i) => i.path === currentItem.path);

  const goNext = () => {
    if (currentIndex < fileItems.length - 1)
      setCurrentItem(fileItems[currentIndex + 1]);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentItem(fileItems[currentIndex - 1]);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const type = getFileIcon(currentItem);
  const downloadUrl = rawDownloadUrl(currentItem.path);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-sm">
      {/* Header */}
      <header className="flex h-12 shrink-0 items-center gap-2 px-3">
        <button onClick={onClose} className="btn-icon">
          <X className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-200">
            {currentItem.name}
          </p>
          <p className="text-[10px] text-slate-500">
            {formatSize(currentItem.size)} &middot;{" "}
            {formatDate(currentItem.modified)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {isEditable(currentItem.extension) && (
            <button
              onClick={() => onEdit(currentItem)}
              className="btn-icon"
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onShare(currentItem)}
            className="btn-icon"
            title="Compartilhar"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDownload(currentItem)}
            className="btn-icon"
            title="Baixar"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
        {/* Navigation arrows */}
        {currentIndex > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-2 z-10 rounded-full bg-slate-800/80 p-2 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {currentIndex < fileItems.length - 1 && (
          <button
            onClick={goNext}
            className="absolute right-2 z-10 rounded-full bg-slate-800/80 p-2 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Preview content */}
        {type === "image" && (
          <img
            src={previewUrl(currentItem.path, "big")}
            alt={currentItem.name}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        )}

        {type === "video" && (
          <video
            src={downloadUrl}
            controls
            autoPlay
            className="max-h-full max-w-full rounded-lg"
          >
            <track kind="captions" />
          </video>
        )}

        {type === "audio" && (
          <div className="flex flex-col items-center gap-6">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-green-600/20 to-green-600/5">
              <span className="text-4xl">🎵</span>
            </div>
            <audio src={downloadUrl} controls autoPlay className="w-full max-w-md" />
          </div>
        )}

        {type === "pdf" && (
          <iframe
            src={downloadUrl}
            className="h-full w-full rounded-lg"
            title={currentItem.name}
          />
        )}

        {type === "text" && <TextPreview item={currentItem} />}

        {!["image", "video", "audio", "pdf", "text"].includes(type) && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="text-6xl opacity-50">📄</div>
            <p className="text-sm text-slate-400">
              Pré-visualização não disponível
            </p>
            <a
              href={downloadUrl}
              download
              className="btn btn-primary"
            >
              <Download className="h-4 w-4" />
              Baixar arquivo
            </a>
          </div>
        )}
      </div>

      {/* Counter */}
      {fileItems.length > 1 && (
        <div className="flex justify-center pb-3">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
            {currentIndex + 1} / {fileItems.length}
          </span>
        </div>
      )}
    </div>
  );
}

function TextPreview({ item }: { item: FileItem }) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = rawDownloadUrl(item.path);
    fetch(url)
      .then((r) => r.text())
      .then(setContent)
      .catch(() => setContent("Erro ao carregar arquivo"))
      .finally(() => setLoading(false));
  }, [item.path]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
        Carregando...
      </div>
    );
  }

  return (
    <pre className="max-h-full w-full max-w-4xl overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-300 sm:text-sm">
      {content}
    </pre>
  );
}

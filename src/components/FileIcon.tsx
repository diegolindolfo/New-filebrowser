import {
  Folder,
  FileText,
  Image,
  Film,
  Music,
  FileArchive,
  FileSpreadsheet,
  Presentation,
  FileType,
  File,
  FileCode,
} from "lucide-react";
import { getFileIcon } from "../utils/format";
import type { FileItem } from "../types";

interface Props {
  item: FileItem;
  className?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  folder: Folder,
  image: Image,
  video: Film,
  audio: Music,
  pdf: FileType,
  archive: FileArchive,
  doc: FileText,
  spreadsheet: FileSpreadsheet,
  presentation: Presentation,
  text: FileCode,
  file: File,
};

const COLOR_MAP: Record<string, string> = {
  folder: "text-blue-400",
  image: "text-pink-400",
  video: "text-purple-400",
  audio: "text-green-400",
  pdf: "text-red-400",
  archive: "text-amber-400",
  doc: "text-blue-300",
  spreadsheet: "text-emerald-400",
  presentation: "text-orange-400",
  text: "text-slate-400",
  file: "text-slate-500",
};

export default function FileIcon({ item, className = "h-5 w-5" }: Props) {
  const type = getFileIcon(item);
  const Icon = ICON_MAP[type] || File;
  const color = COLOR_MAP[type] || "text-slate-500";

  return <Icon className={`${className} ${color}`} />;
}

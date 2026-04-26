import { useNavigate } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface Props {
  path: string;
}

export default function Breadcrumbs({ path }: Props) {
  const navigate = useNavigate();
  const parts = path.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1 overflow-x-auto text-sm scrollbar-none">
      <button
        onClick={() => navigate("/files/")}
        className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </button>

      {parts.map((part, i) => {
        const fullPath = "/" + parts.slice(0, i + 1).join("/") + "/";
        const isLast = i === parts.length - 1;

        return (
          <div key={fullPath} className="flex items-center gap-1 shrink-0">
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <button
              onClick={() => navigate(`/files${fullPath}`)}
              className={`rounded-md px-2 py-1 transition-colors ${
                isLast
                  ? "font-medium text-slate-100"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {decodeURIComponent(part)}
            </button>
          </div>
        );
      })}
    </nav>
  );
}

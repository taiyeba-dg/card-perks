import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";

function isTyping() {
  const tag = (document.activeElement as HTMLElement)?.tagName;
  const editable = (document.activeElement as HTMLElement)?.isContentEditable;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || editable;
}

interface Options {
  onOpenHelp: () => void;
}

export function useKeyboardShortcuts({ onOpenHelp }: Options) {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when cmd/ctrl modifier is held (except ⌘K handled by Navbar)
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Ignore when user is typing
      if (isTyping()) return;

      switch (e.key) {
        case "?":
          e.preventDefault();
          onOpenHelp();
          break;
        case "t":
        case "T":
          e.preventDefault();
          toggleTheme();
          break;
        case "h":
        case "H":
          e.preventDefault();
          navigate("/");
          break;
        case "v":
        case "V":
          e.preventDefault();
          navigate("/vouchers");
          break;
        case "c":
        case "C":
          e.preventDefault();
          navigate("/cards");
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpenHelp, navigate, toggleTheme]);
}

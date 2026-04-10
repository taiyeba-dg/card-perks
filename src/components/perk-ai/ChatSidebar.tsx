import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Trash2, X, MessageSquare } from "lucide-react";
import { type ChatSession } from "@/hooks/use-chat-history";
import { useState } from "react";

interface Props {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onClose?: () => void;
  isMobileSheet?: boolean;
}

export default function ChatSidebar({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onClose,
  isMobileSheet,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? sessions.filter((s) =>
        s.title.toLowerCase().includes(search.toLowerCase())
      )
    : sessions;

  const now = Date.now();
  const today = filtered.filter((s) => now - s.updatedAt < 86400000);
  const week = filtered.filter(
    (s) => now - s.updatedAt >= 86400000 && now - s.updatedAt < 604800000
  );
  const older = filtered.filter((s) => now - s.updatedAt >= 604800000);

  const renderGroup = (label: string, items: ChatSession[]) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-2">
        <p className="text-[10px] font-medium text-muted-foreground/35 uppercase tracking-wider px-3 mb-0.5">
          {label}
        </p>
        {items.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              onSelectSession(s.id);
              onClose?.();
            }}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] truncate transition-colors group flex items-center justify-between gap-2 ${
              s.id === activeSessionId
                ? "bg-secondary/70 text-foreground"
                : "text-muted-foreground/70 hover:bg-secondary/30 hover:text-foreground"
            }`}
          >
            <span className="truncate">{s.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(s.id);
              }}
              className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-0.5 rounded hover:bg-destructive/20 hover:text-destructive transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${isMobileSheet ? "bg-background" : "bg-background"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-11 flex-shrink-0 border-b border-border/10">
        <span className="text-sm font-semibold text-foreground/80">Perk AI</span>
        {isMobileSheet && onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary/50 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground/60" />
          </button>
        )}
      </div>

      {/* New Chat + Search */}
      <div className="px-2 pt-2 pb-1 flex-shrink-0 space-y-1.5">
        <button
          onClick={() => {
            onNewChat();
            onClose?.();
          }}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] text-muted-foreground/60 hover:text-foreground hover:bg-secondary/30 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New chat</span>
        </button>

        {sessions.length > 3 && (
          <div className="relative px-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/30" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-7 pr-2 py-1 rounded-md bg-transparent border border-border/15 text-[11px] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/20 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-1 pt-1 min-h-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <MessageSquare className="w-6 h-6 text-muted-foreground/15 mb-1.5" />
            <p className="text-[11px] text-muted-foreground/30">
              {search ? "No matches" : "No chats yet"}
            </p>
          </div>
        ) : (
          <>
            {renderGroup("Today", today)}
            {renderGroup("This week", week)}
            {renderGroup("Older", older)}
          </>
        )}
      </div>
    </div>
  );
}

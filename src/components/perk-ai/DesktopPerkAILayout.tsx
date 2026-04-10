import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowUp, Plus, PanelLeftClose, PanelLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import ChatMessages, { type Message } from "./ChatMessages";
import ChatSidebar from "./ChatSidebar";
import { type ChatSession } from "@/hooks/use-chat-history";
import { useState } from "react";

const quickActions = [
  { icon: "💳", label: "Best Card", prompt: "Which card should I get for ₹50K/month spending?" },
  { icon: "🍽️", label: "Dining", prompt: "Best card for dining out?" },
  { icon: "✈️", label: "Travel", prompt: "How to maximize travel rewards?" },
  { icon: "🛒", label: "Shopping", prompt: "Which card for online shopping?" },
  { icon: "📊", label: "Compare", prompt: "Compare HDFC Diners Black vs Axis Magnus" },
];

interface Props {
  messages: Message[];
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSend: (text: string) => void;
  onNewChat: () => void;
  isStreaming: boolean;
  hasStarted: boolean;
  messageCount: number;
  scrollRef: React.RefObject<HTMLDivElement>;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DesktopPerkAILayout({
  messages, input, onInputChange, onSubmit, onSend,
  onNewChat, isStreaming, hasStarted, messageCount, scrollRef,
  sessions, activeSessionId, onSelectSession, onDeleteSession,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as unknown as React.FormEvent);
    }
  };

  const chatTitle = messages.find((m) => m.role === "user")?.content.slice(0, 50) || "";

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex-shrink-0 overflow-hidden border-r border-border/15"
          >
            <div className="w-[260px] h-full">
              <ChatSidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onNewChat={onNewChat}
                onSelectSession={onSelectSession}
                onDeleteSession={onDeleteSession}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar — minimal, always visible */}
        <div className="flex items-center gap-3 px-4 h-11 flex-shrink-0 border-b border-border/10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary/50 transition-colors"
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4 text-muted-foreground/60" />
            ) : (
              <PanelLeft className="w-4 h-4 text-muted-foreground/60" />
            )}
          </button>

          {hasStarted && (
            <>
              <div className="h-4 w-px bg-border/20" />
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <Sparkles className="w-3 h-3 text-primary/50 flex-shrink-0" />
                <span className="text-xs text-muted-foreground/60 truncate">
                  {chatTitle}{chatTitle.length >= 50 ? "…" : ""}
                </span>
              </div>
              <button
                onClick={onNewChat}
                className="flex items-center gap-1 text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-secondary/40"
              >
                <Plus className="w-3 h-3" /> New
              </button>
            </>
          )}
        </div>

        {/* Empty state — centered */}
        {!hasStarted ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="text-center mb-10"
            >
              <Sparkles className="w-7 h-7 text-primary/50 mx-auto mb-4" />
              <h1 className="font-serif text-3xl font-bold text-foreground/80 tracking-tight">
                {getGreeting()}
              </h1>
              <p className="text-muted-foreground/45 text-sm mt-1.5">How can I help with your cards?</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="w-full max-w-xl"
            >
              <form onSubmit={onSubmit} className="relative">
                <div className="rounded-2xl border border-border/25 bg-card/60 overflow-hidden focus-within:border-primary/20 transition-colors">
                  <Textarea
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="How can I help you today?"
                    rows={2}
                    className="bg-transparent border-0 focus-visible:ring-0 text-sm resize-none px-4 pt-3.5 pb-11 min-h-[72px]"
                  />
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                    <button type="button" className="w-6 h-6 rounded-md border border-border/25 flex items-center justify-center hover:bg-secondary/40 transition-colors">
                      <Plus className="w-3 h-3 text-muted-foreground/50" />
                    </button>
                    <button
                      type="submit"
                      disabled={isStreaming || !input.trim()}
                      className="w-7 h-7 rounded-full bg-foreground/80 flex items-center justify-center disabled:opacity-15 disabled:cursor-not-allowed transition-all hover:bg-foreground"
                    >
                      <ArrowUp className="w-3.5 h-3.5 text-background" />
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-1.5 mt-4 max-w-xl"
            >
              {quickActions.map((a, i) => (
                <motion.button
                  key={a.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 + i * 0.03 }}
                  onClick={() => onSend(a.prompt)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-border/20 text-[11px] text-muted-foreground/60 hover:text-foreground hover:border-border/40 transition-all"
                >
                  <span className="text-xs">{a.icon}</span> {a.label}
                </motion.button>
              ))}
            </motion.div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth min-h-0">
              <div className="max-w-[680px] mx-auto px-6 py-6">
                <ChatMessages messages={messages} isStreaming={isStreaming} onRetry={onSend} />
              </div>
            </div>

            {/* Bottom input */}
            <div className="flex-shrink-0 px-6 pb-3 pt-1">
              <div className="max-w-[680px] mx-auto">
                <form onSubmit={onSubmit} className="relative">
                  <div className="rounded-2xl border border-border/25 bg-card/60 overflow-hidden focus-within:border-primary/20 transition-colors">
                    <Textarea
                      value={input}
                      onChange={(e) => onInputChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Reply…"
                      rows={1}
                      className="bg-transparent border-0 focus-visible:ring-0 text-sm resize-none px-4 pt-3 pb-10 min-h-[48px]"
                    />
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                      <button type="button" className="w-6 h-6 rounded-md border border-border/25 flex items-center justify-center hover:bg-secondary/40 transition-colors">
                        <Plus className="w-3 h-3 text-muted-foreground/50" />
                      </button>
                      <button
                        type="submit"
                        disabled={isStreaming || !input.trim()}
                        className="w-7 h-7 rounded-full bg-foreground/80 flex items-center justify-center disabled:opacity-15 disabled:cursor-not-allowed transition-all hover:bg-foreground"
                      >
                        <ArrowUp className="w-3.5 h-3.5 text-background" />
                      </button>
                    </div>
                  </div>
                </form>
                <p className="text-[9px] text-muted-foreground/30 text-center mt-1.5">
                  Perk AI can make mistakes. Verify important card details.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

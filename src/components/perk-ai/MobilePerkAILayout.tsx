import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowUp, Plus, Menu, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import ChatMessages, { type Message } from "./ChatMessages";
import ChatSidebar from "./ChatSidebar";
import { type ChatSession } from "@/hooks/use-chat-history";

const suggestedPrompts = [
  { emoji: "🍽️", text: "Best card for dining out?" },
  { emoji: "✈️", text: "How to maximize travel rewards?" },
  { emoji: "💳", text: "Is my card's annual fee worth it?" },
  { emoji: "🛒", text: "Which card for online shopping?" },
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
  myCardsContext: Array<{ id: string; name: string } | null>;
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

export default function MobilePerkAILayout({
  messages, input, onInputChange, onSubmit, onSend,
  onNewChat, isStreaming, hasStarted, messageCount,
  myCardsContext, scrollRef,
  sessions, activeSessionId, onSelectSession, onDeleteSession,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[280px] z-50"
            >
              <ChatSidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onNewChat={onNewChat}
                onSelectSession={onSelectSession}
                onDeleteSession={onDeleteSession}
                onClose={() => setSidebarOpen(false)}
                isMobileSheet
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Account for bottom nav: h-[100dvh] minus ~80px bottom nav + safe area */}
      <div className="flex flex-col relative" style={{ height: "calc(100dvh - 80px)" }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-3 py-2.5 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center"
          >
            <Menu className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-sm font-semibold text-foreground">Perk AI</span>
            {hasStarted && (
              <span className="text-[9px] text-muted-foreground/40">
                {messageCount} msg{messageCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button
            onClick={onNewChat}
            className="w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center"
          >
            <Plus className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Empty state */}
        {!hasStarted ? (
          <div className="flex-1 flex flex-col px-4 min-h-0">
            {/* Greeting centered in available space */}
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <Sparkles className="w-7 h-7 text-primary/50 mx-auto mb-4" />
                <h1 className="font-serif text-2xl font-bold text-foreground/85 tracking-tight">
                  How can I help you<br />{getGreeting().toLowerCase().replace("good ", "this ")}?
                </h1>
              </motion.div>
            </div>
          </div>
        ) : (
          /* Messages */
          <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 px-3 scroll-smooth min-h-0">
            <ChatMessages messages={messages} isStreaming={isStreaming} onRetry={onSend} />
          </div>
        )}

        {/* Bottom input — always visible */}
        <div className="flex-shrink-0 px-3 pb-2 pt-1">
          <form onSubmit={onSubmit} className="relative">
            <div className="rounded-2xl border border-border/25 bg-card/50 shadow-sm overflow-hidden focus-within:border-primary/25 transition-all">
              <Textarea
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={hasStarted ? "Reply..." : "Chat with Perk AI"}
                rows={1}
                className="bg-transparent border-0 focus-visible:ring-0 text-sm resize-none px-4 pt-3 pb-10 min-h-[44px]"
              />
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                <button type="button" className="w-7 h-7 rounded-lg border border-border/30 flex items-center justify-center hover:bg-secondary/50 transition-colors">
                  <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button
                  type="submit"
                  disabled={isStreaming || !input.trim()}
                  className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  <ArrowUp className="w-4 h-4 text-background" />
                </button>
              </div>
            </div>
          </form>

          {/* Suggested prompts below input on empty state */}
          {!hasStarted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-1.5 mt-2"
            >
              {suggestedPrompts.map((p, i) => (
                <motion.button
                  key={p.text}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 + i * 0.04 }}
                  onClick={() => onSend(p.text)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/20 text-[11px] text-muted-foreground hover:text-foreground active:scale-[0.97] transition-all"
                >
                  <span>{p.emoji}</span>
                  <span>{p.text}</span>
                </motion.button>
              ))}
            </motion.div>
          )}

          {hasStarted && (
            <p className="text-[9px] text-muted-foreground/30 text-center mt-1">
              Perk AI can make mistakes. Verify important details.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

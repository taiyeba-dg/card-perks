import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MarkdownContent from "./MarkdownContent";
import CopyButton from "./CopyButton";
import { ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";
import ThinkingIndicator from "./ThinkingIndicator";
import { toast } from "sonner";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  thinkingText?: string;
}

interface Props {
  messages: Message[];
  isStreaming?: boolean;
  onRetry?: (userMessage: string) => void;
}

export default function ChatMessages({ messages, isStreaming, onRetry }: Props) {
  const [feedback, setFeedback] = useState<Record<number, "up" | "down">>({});

  const handleFeedback = (index: number, type: "up" | "down") => {
    setFeedback((prev) => {
      if (prev[index] === type) {
        const next = { ...prev };
        delete next[index];
        return next;
      }
      return { ...prev, [index]: type };
    });
    toast.success(type === "up" ? "Thanks for the feedback!" : "Sorry about that. We'll improve.", { duration: 2000 });
  };

  const handleRetry = (assistantIndex: number) => {
    // Find the user message right before this assistant message
    for (let j = assistantIndex - 1; j >= 0; j--) {
      if (messages[j].role === "user") {
        onRetry?.(messages[j].content);
        return;
      }
    }
  };

  return (
    <AnimatePresence initial={false}>
      {messages.map((msg, i) => {
        const isLast = i === messages.length - 1;
        const isAssistantStreaming = isLast && isStreaming && msg.role === "assistant";
        const isEmpty = !msg.content;
        const fb = feedback[i];

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            {msg.role === "user" ? (
              <div className="flex justify-end mb-5">
                <div className="max-w-[80%]">
                  <div className="rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed bg-secondary/60 text-foreground">
                    <div className="whitespace-pre-line">{msg.content}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                {(msg.thinkingText || (isEmpty && isAssistantStreaming)) && (
                  <div className="mb-2.5">
                    <ThinkingIndicator
                      thinkingText={msg.thinkingText || "Thinking…"}
                      isActive={isAssistantStreaming && isEmpty}
                    />
                  </div>
                )}

                {msg.content && (
                  <div className="text-[14px] leading-[1.7] text-foreground/85">
                    <MarkdownContent content={msg.content} />
                  </div>
                )}

                {msg.content && !isAssistantStreaming && (
                  <div className="flex items-center gap-0.5 mt-2.5">
                    <CopyButton text={msg.content} />
                    <button
                      onClick={() => handleFeedback(i, "up")}
                      className={`p-1.5 rounded-md transition-colors ${
                        fb === "up"
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground/30 hover:text-muted-foreground/60 hover:bg-secondary/40"
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleFeedback(i, "down")}
                      className={`p-1.5 rounded-md transition-colors ${
                        fb === "down"
                          ? "text-destructive bg-destructive/10"
                          : "text-muted-foreground/30 hover:text-muted-foreground/60 hover:bg-secondary/40"
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRetry(i)}
                      className="p-1.5 rounded-md hover:bg-secondary/40 transition-colors text-muted-foreground/30 hover:text-muted-foreground/60"
                      title="Retry this response"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}

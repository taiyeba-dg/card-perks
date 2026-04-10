import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useMinLoading } from "@/hooks/use-min-loading";
import { PerkAISkeleton } from "@/components/PageSkeletons";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { type Message } from "@/components/perk-ai/ChatMessages";
import { useMyCards } from "@/hooks/use-my-cards";
import { cards as allCards } from "@/data/cards";
import { useIsMobile } from "@/hooks/use-mobile";
import MobilePerkAILayout from "@/components/perk-ai/MobilePerkAILayout";
import DesktopPerkAILayout from "@/components/perk-ai/DesktopPerkAILayout";
import { useChatHistory } from "@/hooks/use-chat-history";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/perk-ai-chat`;

function generateThinkingText(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes("compar")) return "Thinking about comparing cards...";
  if (lower.includes("best") && lower.includes("dining")) return "Thinking about dining rewards...";
  if (lower.includes("best") && lower.includes("travel")) return "Thinking about travel cards...";
  if (lower.includes("fee") || lower.includes("worth")) return "Thinking about fee analysis...";
  if (lower.includes("reward")) return "Thinking about reward strategies...";
  if (lower.includes("lounge")) return "Thinking about lounge access...";
  const snippet = userMessage.slice(0, 40);
  return `Thinking about ${snippet}${userMessage.length > 40 ? "..." : ""}`;
}

export default function PerkAI() {
  const loading = useMinLoading(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { state: myCardsState } = useMyCards();
  const isMobile = useIsMobile();
  const chatHistory = useChatHistory();

  const myCardsContext = myCardsState.cards.map((entry) => {
    const card = allCards.find((c) => c.id === entry.cardId);
    return card ? { id: card.id, name: card.name, monthlySpend: entry.monthlySpend } : null;
  }).filter(Boolean);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // Sync messages to chat history
  useEffect(() => {
    if (chatHistory.activeSessionId && messages.length > 0) {
      chatHistory.updateSession(chatHistory.activeSessionId, messages);
    }
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    let sessionId = chatHistory.activeSessionId;
    if (!hasStarted) {
      setHasStarted(true);
      sessionId = chatHistory.createSession();
    }

    const thinkingText = generateThinkingText(text);
    const userMsg: Message = { role: "user", content: text, timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages([...newMessages, { role: "assistant", content: "", timestamp: Date.now(), thinkingText }]);
    setInput("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let assistantContent = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          myCards: myCardsContext,
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        if (resp.status === 429) toast.error("Rate limit exceeded. Please try again in a moment.");
        else if (resp.status === 402) toast.error("AI credits exhausted. Please add funds.");
        else toast.error(errorData.error || "Failed to get AI response.");
        setIsStreaming(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              const snapshot = assistantContent;
              setMessages((prev) => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: snapshot } : m));
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              const snapshot = assistantContent;
              setMessages((prev) => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: snapshot } : m));
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.error("Stream error:", e);
        toast.error("Failed to connect to AI. Please try again.");
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [messages, isStreaming, hasStarted, chatHistory.activeSessionId]);

  const handleNewChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setHasStarted(false);
  };

  const handleSelectSession = (id: string) => {
    const session = chatHistory.loadSession(id);
    if (session) {
      setMessages(session.messages);
      setHasStarted(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const messageCount = messages.filter((m) => m.role === "user").length;

  return (
    <div className="h-screen bg-background overflow-hidden">
      <SEO fullTitle="AI Credit Card Recommendations | CardPerks" description="Get AI-powered credit card recommendations." path="/perk-ai" />
      <main className="h-full">
        <div className={isMobile ? "" : ""}>
          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-y-auto pt-6 max-w-3xl mx-auto px-4">
              <PerkAISkeleton />
            </motion.div>
          ) : isMobile ? (
              <MobilePerkAILayout
                messages={messages}
                input={input}
                onInputChange={setInput}
                onSubmit={handleSubmit}
                onSend={sendMessage}
                onNewChat={handleNewChat}
                isStreaming={isStreaming}
                hasStarted={hasStarted}
                messageCount={messageCount}
                myCardsContext={myCardsContext}
                scrollRef={scrollRef as React.RefObject<HTMLDivElement>}
                sessions={chatHistory.sessions}
                activeSessionId={chatHistory.activeSessionId}
                onSelectSession={handleSelectSession}
                onDeleteSession={chatHistory.deleteSession}
              />
            ) : (
              <DesktopPerkAILayout
                messages={messages}
                input={input}
                onInputChange={setInput}
                onSubmit={handleSubmit}
                onSend={sendMessage}
                onNewChat={handleNewChat}
                isStreaming={isStreaming}
                hasStarted={hasStarted}
                messageCount={messageCount}
                scrollRef={scrollRef as React.RefObject<HTMLDivElement>}
                sessions={chatHistory.sessions}
                activeSessionId={chatHistory.activeSessionId}
                onSelectSession={handleSelectSession}
                onDeleteSession={chatHistory.deleteSession}
              />
            )}
        </div>
      </main>
    </div>
  );
}

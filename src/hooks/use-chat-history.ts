import { useState, useCallback, useEffect } from "react";
import { type Message } from "@/components/perk-ai/ChatMessages";

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "perk-ai-chat-history";
const MAX_SESSIONS = 50;

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  const createSession = useCallback((): string => {
    const id = crypto.randomUUID();
    const session: ChatSession = {
      id,
      title: "New chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(id);
    return id;
  }, []);

  const updateSession = useCallback((id: string, messages: Message[]) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const title =
          messages.find((m) => m.role === "user")?.content.slice(0, 60) || "New chat";
        return { ...s, messages, title, updatedAt: Date.now() };
      })
    );
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(null);
  }, [activeSessionId]);

  const loadSession = useCallback((id: string) => {
    setActiveSessionId(id);
    return sessions.find((s) => s.id === id) || null;
  }, [sessions]);

  const clearAll = useCallback(() => {
    setSessions([]);
    setActiveSessionId(null);
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  return {
    sessions,
    activeSessionId,
    activeSession,
    createSession,
    updateSession,
    deleteSession,
    loadSession,
    setActiveSessionId,
    clearAll,
  };
}

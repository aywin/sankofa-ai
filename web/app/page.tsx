"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import { DisclaimerBanner } from "@/components/chat/DisclaimerBanner";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { ProfileSelector, type Profil } from "@/components/chat/ProfileSelector";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { AuthModal } from "@/components/chat/AuthModal";
import { HistoryIcon, LafiMark } from "@/components/chat/icons";
import { useAuth } from "@/lib/useAuth";
import {
  deleteConversation,
  loadConversations,
  migrateLocalToRemote,
  newConversationId,
  saveConversation,
  type StoredConversation,
} from "@/lib/conversations";

const PROFIL_STORAGE_KEY = "lafi-profil";

function isProfil(value: string | null): value is Profil {
  return value === "particulier" || value === "tradipraticien" || value === "pro_sante";
}

function ChatSession({
  conversationId,
  initialMessages,
  profil,
  userId,
  onMessagesChange,
}: {
  conversationId: string;
  initialMessages: UIMessage[];
  profil: Profil;
  userId: string | null;
  onMessagesChange: () => void;
}) {
  const { messages, sendMessage, status, stop, error } = useChat({
    id: conversationId,
    messages: initialMessages,
  });

  useEffect(() => {
    saveConversation(userId, conversationId, messages).then(onMessagesChange);
  }, [conversationId, messages, userId, onMessagesChange]);

  const isBusy = status === "submitted" || status === "streaming";

  const handleSend = ({ text, files }: { text: string; files?: FileList }) => {
    sendMessage({ text, files }, { body: { profil } });
  };

  const handleExampleClick = (text: string) => {
    sendMessage({ text }, { body: { profil } });
  };

  return (
    <>
      <main className="flex-1 overflow-y-auto">
        <ChatMessages messages={messages} status={status} onExampleClick={handleExampleClick} />
        {error && (
          <div className="mx-auto max-w-2xl px-4 pb-4">
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              Une erreur est survenue. Réessaie dans un instant.
            </p>
          </div>
        )}
      </main>
      <ChatInput onSend={handleSend} onStop={stop} disabled={isBusy} />
    </>
  );
}

export default function Home() {
  const { user, signIn, signUp, signOut } = useAuth();

  // Valeurs neutres au rendu serveur ET au premier rendu client (évite un
  // mismatch d'hydratation) ; l'effet ci-dessous restaure le vrai état
  // juste après le montage.
  const [profil, setProfil] = useState<Profil>("particulier");
  const [conversations, setConversations] = useState<StoredConversation[]>([]);
  const [activeId, setActiveId] = useState<string>(newConversationId);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const migratedForUser = useRef<string | null>(null);

  useEffect(() => {
    const storedProfil = window.localStorage.getItem(PROFIL_STORAGE_KEY);
    if (isProfil(storedProfil)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfil(storedProfil);
    }
  }, []);

  const refreshConversations = useCallback(() => {
    loadConversations(user?.id ?? null).then(setConversations);
  }, [user?.id]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // À la connexion (une fois par session utilisateur) : on transfère
  // l'historique invité local vers le compte qui vient de se connecter.
  useEffect(() => {
    if (user && migratedForUser.current !== user.id) {
      migratedForUser.current = user.id;
      migrateLocalToRemote(user.id).then(refreshConversations);
    }
  }, [user, refreshConversations]);

  const handleProfilChange = (next: Profil) => {
    setProfil(next);
    window.localStorage.setItem(PROFIL_STORAGE_KEY, next);
  };

  const handleNewConversation = () => {
    setActiveId(newConversationId());
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(user?.id ?? null, id).then(refreshConversations);
    if (id === activeId) {
      setActiveId(newConversationId());
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeId);

  return (
    <div className="flex h-dvh flex-col">
      <header className="px-4 py-3">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
          <h1 className="flex items-center gap-1.5 text-lg font-semibold text-emerald-700 dark:text-emerald-400">
            <LafiMark className="h-5 w-5" />
            Lafi
          </h1>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Historique des conversations"
            className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
          >
            <HistoryIcon />
          </button>
        </div>
      </header>

      <ChatSession
        key={activeId}
        conversationId={activeId}
        initialMessages={activeConversation?.messages ?? []}
        profil={profil}
        userId={user?.id ?? null}
        onMessagesChange={refreshConversations}
      />

      <ProfileSelector value={profil} onChange={handleProfilChange} />
      <DisclaimerBanner />

      <ConversationSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        userEmail={user?.email ?? null}
        onSignInClick={() => {
          setSidebarOpen(false);
          setAuthModalOpen(true);
        }}
        onSignOut={() => signOut()}
      />

      {authModalOpen && (
        <AuthModal onClose={() => setAuthModalOpen(false)} onSignIn={signIn} onSignUp={signUp} />
      )}
    </div>
  );
}

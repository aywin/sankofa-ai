"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { DisclaimerBanner } from "@/components/chat/DisclaimerBanner";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput, type ChatInputHandle } from "@/components/chat/ChatInput";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { AuthModal } from "@/components/chat/AuthModal";
import { ContributeModal } from "@/components/chat/ContributeModal";
import { LafiMark, PanelIcon } from "@/components/chat/icons";
import { useAuth } from "@/lib/useAuth";
import {
  deleteConversation,
  loadConversations,
  migrateLocalToRemote,
  newConversationId,
  saveConversation,
  type StoredConversation,
} from "@/lib/conversations";
import { loadFavorites, migrateLocalFavoritesToRemote, type FavoritePlant } from "@/lib/favorites";

const SIDEBAR_STORAGE_KEY = "lafi-sidebar-visible";

// Les refus de la route (corps trop lourd, trop d'images…) arrivent en JSON
// { message } : on les montre tels quels, ils sont rédigés pour l'utilisateur.
function messageErreur(error: Error): string {
  try {
    const parsed = JSON.parse(error.message) as { message?: string };
    if (parsed.message) return parsed.message;
  } catch {}
  return "Lafi n'a pas pu répondre. Vérifie ta connexion, puis réessaie.";
}

function ChatSession({
  conversationId,
  initialMessages,
  initialQuery,
  userId,
  onMessagesChange,
  inputRef,
  onContribute,
  onFavoriteChange,
}: {
  conversationId: string;
  initialMessages: UIMessage[];
  initialQuery: string | null;
  userId: string | null;
  onMessagesChange: () => void;
  inputRef: React.Ref<ChatInputHandle>;
  onContribute: () => void;
  onFavoriteChange: () => void;
}) {
  const { messages, sendMessage, regenerate, clearError, status, stop, error } = useChat({
    id: conversationId,
    messages: initialMessages,
  });
  const initialQuerySent = useRef(false);

  useEffect(() => {
    saveConversation(userId, conversationId, messages).then(onMessagesChange);
  }, [conversationId, messages, userId, onMessagesChange]);

  // Arrivée depuis la landing (ou depuis "En discuter avec Lafi" du
  // laboratoire) avec une question déjà formulée dans l'URL (?q=...) —
  // ne se déclenche que sur une conversation neuve, une seule fois. Le
  // ref (plutôt qu'un simple test sur initialMessages.length) protège
  // contre un double-appel de l'effet — Strict Mode en dev, ou tout
  // autre remount — qui enverrait sinon le même message deux fois.
  // `initialQuery` est lu dans l'URL par le parent APRÈS le montage : l'effet
  // doit donc réagir à son arrivée, pas seulement tourner au montage (sinon
  // la question venue de la landing n'était jamais envoyée — audit du 21/10).
  useEffect(() => {
    if (initialQuery && initialMessages.length === 0 && !initialQuerySent.current) {
      initialQuerySent.current = true;
      sendMessage({ text: initialQuery });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const isBusy = status === "submitted" || status === "streaming";

  const handleSend = ({ text, files }: { text: string; files?: FileList }) => {
    sendMessage({ text, files });
  };

  const handleExampleClick = (text: string) => {
    sendMessage({ text });
  };

  return (
    <>
      <main className="flex-1 overflow-y-auto">
        <ChatMessages
          messages={messages}
          status={status}
          onExampleClick={handleExampleClick}
          onContribute={onContribute}
          onFavoriteChange={onFavoriteChange}
        />
        {error && (
          <div className="mx-auto max-w-[880px] px-4 pb-4">
            <div className="flex items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              <p>{messageErreur(error)}</p>
              <button
                type="button"
                onClick={() => {
                  clearError();
                  regenerate();
                }}
                className="shrink-0 rounded-full border border-red-300 px-3 py-1 font-medium transition hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}
      </main>
      <ChatInput ref={inputRef} onSend={handleSend} onStop={stop} disabled={isBusy} />
    </>
  );
}

export default function ChatPage() {
  const { user, signIn, signUp, signOut } = useAuth();

  // Valeurs neutres au rendu serveur ET au premier rendu client (évite un
  // mismatch d'hydratation) ; l'effet ci-dessous restaure le vrai état
  // juste après le montage.
  const [conversations, setConversations] = useState<StoredConversation[]>([]);
  const [favorites, setFavorites] = useState<FavoritePlant[]>([]);
  const [activeId, setActiveId] = useState<string>(newConversationId);
  // Tiroir mobile (overlay, fermé par défaut).
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Panneau persistant desktop (visible par défaut, repliable).
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState<string | null>(null);
  const migratedForUser = useRef<string | null>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);

  useEffect(() => {
    const storedSidebar = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (storedSidebar === "false") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSidebarVisible(false);
    }

    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setInitialQuery(q);
      window.history.replaceState(null, "", "/chat");
    }
  }, []);

  const refreshConversations = useCallback(() => {
    loadConversations(user?.id ?? null).then(setConversations);
  }, [user?.id]);

  const refreshFavorites = useCallback(() => {
    loadFavorites(user?.id ?? null).then(setFavorites);
  }, [user?.id]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  // À la connexion (une fois par session utilisateur) : on transfère
  // l'historique et les favoris invités (locaux) vers le compte qui
  // vient de se connecter.
  useEffect(() => {
    if (user && migratedForUser.current !== user.id) {
      migratedForUser.current = user.id;
      migrateLocalToRemote(user.id).then(refreshConversations);
      migrateLocalFavoritesToRemote(user.id).then(refreshFavorites);
    }
  }, [user, refreshConversations, refreshFavorites]);

  // Un seul bouton pilote les deux : sur mobile, `open` a un effet visuel
  // (tiroir) et `visible` n'en a aucun (media query md: inactive) ; sur
  // desktop c'est l'inverse. Pas besoin de détecter la largeur d'écran.
  const handleToggleSidebar = () => {
    setSidebarOpen((v) => !v);
    setSidebarVisible((v) => {
      const next = !v;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  };

  // La question venue de l'URL ne vaut que pour la première conversation :
  // sans ce nettoyage, "Nouvelle conversation" la renverrait.
  const handleNewConversation = () => {
    setInitialQuery(null);
    setActiveId(newConversationId());
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setInitialQuery(null);
    setActiveId(id);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(user?.id ?? null, id).then(refreshConversations);
    if (id === activeId) {
      setActiveId(newConversationId());
    }
  };

  const handleExplore = (target: "plants" | "maladies" | "photo") => {
    setSidebarOpen(false);
    if (target === "photo") {
      chatInputRef.current?.openFilePicker();
    }
  };

  const handleContribute = () => {
    setSidebarOpen(false);
    setContributeModalOpen(true);
  };

  const activeConversation = conversations.find((c) => c.id === activeId);

  return (
    <div className="flex h-dvh">
      <ConversationSidebar
        open={sidebarOpen}
        visible={sidebarVisible}
        onClose={() => setSidebarOpen(false)}
        onExplore={handleExplore}
        onContribute={handleContribute}
        conversations={conversations}
        favorites={favorites}
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

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={handleToggleSidebar}
            aria-label="Afficher/masquer la barre latérale"
            className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
          >
            <PanelIcon />
          </button>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-lg font-semibold text-emerald-700 dark:text-emerald-400"
          >
            <LafiMark className="h-5 w-5" />
            Lafi
          </Link>
        </header>

        <ChatSession
          key={activeId}
          conversationId={activeId}
          initialMessages={activeConversation?.messages ?? []}
          initialQuery={activeConversation ? null : initialQuery}
          userId={user?.id ?? null}
          onMessagesChange={refreshConversations}
          inputRef={chatInputRef}
          onContribute={handleContribute}
          onFavoriteChange={refreshFavorites}
        />

        <DisclaimerBanner />
      </div>

      {authModalOpen && (
        <AuthModal onClose={() => setAuthModalOpen(false)} onSignIn={signIn} onSignUp={signUp} />
      )}
      {contributeModalOpen && (
        <ContributeModal onClose={() => setContributeModalOpen(false)} />
      )}
    </div>
  );
}

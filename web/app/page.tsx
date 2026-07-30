"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import { DisclaimerBanner } from "@/components/chat/DisclaimerBanner";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput, type ChatInputHandle } from "@/components/chat/ChatInput";
import { ProfileSelector, type Profil } from "@/components/chat/ProfileSelector";
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

const PROFIL_STORAGE_KEY = "lafi-profil";
const SIDEBAR_STORAGE_KEY = "lafi-sidebar-visible";

function isProfil(value: string | null): value is Profil {
  return value === "particulier" || value === "tradipraticien" || value === "pro_sante";
}

function ChatSession({
  conversationId,
  initialMessages,
  profil,
  userId,
  onMessagesChange,
  inputRef,
  onContribute,
  onFavoriteChange,
}: {
  conversationId: string;
  initialMessages: UIMessage[];
  profil: Profil;
  userId: string | null;
  onMessagesChange: () => void;
  inputRef: React.Ref<ChatInputHandle>;
  onContribute: () => void;
  onFavoriteChange: () => void;
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
        <ChatMessages
          messages={messages}
          status={status}
          onExampleClick={handleExampleClick}
          onContribute={onContribute}
          onFavoriteChange={onFavoriteChange}
        />
        {error && (
          <div className="mx-auto max-w-[880px] px-4 pb-4">
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              Une erreur est survenue. Réessaie dans un instant.
            </p>
          </div>
        )}
      </main>
      <ChatInput ref={inputRef} onSend={handleSend} onStop={stop} disabled={isBusy} />
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
  const [favorites, setFavorites] = useState<FavoritePlant[]>([]);
  const [activeId, setActiveId] = useState<string>(newConversationId);
  // Tiroir mobile (overlay, fermé par défaut).
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Panneau persistant desktop (visible par défaut, repliable).
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const migratedForUser = useRef<string | null>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);

  useEffect(() => {
    const storedProfil = window.localStorage.getItem(PROFIL_STORAGE_KEY);
    if (isProfil(storedProfil)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfil(storedProfil);
    }
    const storedSidebar = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (storedSidebar === "false") {
      setSidebarVisible(false);
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

  const handleProfilChange = (next: Profil) => {
    setProfil(next);
    window.localStorage.setItem(PROFIL_STORAGE_KEY, next);
  };

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
          <h1 className="flex items-center gap-1.5 text-lg font-semibold text-emerald-700 dark:text-emerald-400">
            <LafiMark className="h-5 w-5" />
            Lafi
          </h1>
        </header>

        <ChatSession
          key={activeId}
          conversationId={activeId}
          initialMessages={activeConversation?.messages ?? []}
          profil={profil}
          userId={user?.id ?? null}
          onMessagesChange={refreshConversations}
          inputRef={chatInputRef}
          onContribute={handleContribute}
          onFavoriteChange={refreshFavorites}
        />

        <ProfileSelector value={profil} onChange={handleProfilChange} />
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

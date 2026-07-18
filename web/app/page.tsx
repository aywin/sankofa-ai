"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import { DisclaimerBanner } from "@/components/chat/DisclaimerBanner";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { ProfileSelector, type Profil } from "@/components/chat/ProfileSelector";
import { LafiMark } from "@/components/chat/icons";

const PROFIL_STORAGE_KEY = "lafi-profil";

function isProfil(value: string | null): value is Profil {
  return value === "particulier" || value === "tradipraticien" || value === "pro_sante";
}

export default function Home() {
  const { messages, sendMessage, status, stop, error } = useChat();
  // "particulier" au rendu serveur ET au premier rendu client (évite un
  // mismatch d'hydratation) ; l'effet ci-dessous restaure la préférence
  // stockée juste après le montage.
  const [profil, setProfil] = useState<Profil>("particulier");

  useEffect(() => {
    const stored = window.localStorage.getItem(PROFIL_STORAGE_KEY);
    if (isProfil(stored)) {
      // Valeur lisible seulement côté client : démarrer à "particulier" évite
      // le mismatch d'hydratation, ce setState post-montage restaure le choix.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfil(stored);
    }
  }, []);

  const handleProfilChange = (next: Profil) => {
    setProfil(next);
    window.localStorage.setItem(PROFIL_STORAGE_KEY, next);
  };

  const isBusy = status === "submitted" || status === "streaming";

  const handleSend = ({ text, files }: { text: string; files?: FileList }) => {
    sendMessage({ text, files }, { body: { profil } });
  };

  const handleExampleClick = (text: string) => {
    sendMessage({ text }, { body: { profil } });
  };

  return (
    <div className="flex h-dvh flex-col">
      <header className="px-4 py-3">
        <h1 className="mx-auto flex max-w-2xl items-center gap-1.5 text-lg font-semibold text-emerald-700 dark:text-emerald-400">
          <LafiMark className="h-5 w-5" />
          Lafi
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto">
        <ChatMessages
          messages={messages}
          status={status}
          onExampleClick={handleExampleClick}
        />
        {error && (
          <div className="mx-auto max-w-2xl px-4 pb-4">
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              Une erreur est survenue. Réessaie dans un instant.
            </p>
          </div>
        )}
      </main>

      <ProfileSelector value={profil} onChange={handleProfilChange} />
      <ChatInput onSend={handleSend} onStop={stop} disabled={isBusy} />
      <DisclaimerBanner />
    </div>
  );
}

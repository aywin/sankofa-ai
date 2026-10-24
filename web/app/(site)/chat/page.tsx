"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { DisclaimerBanner } from "@/components/chat/DisclaimerBanner";
import { ChatMessages, plantesProposees } from "@/components/chat/ChatMessages";
import { PanneauPlantes } from "@/components/chat/PanneauPlantes";
import { ChatInput } from "@/components/chat/ChatInput";
import { EVENEMENT_CONVERSATIONS } from "@/components/app/Sidebar";
import { useAuth } from "@/lib/useAuth";
import { loadConversations, newConversationId, saveConversation, type StoredConversation } from "@/lib/conversations";

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
}: {
  conversationId: string;
  initialMessages: UIMessage[];
  initialQuery: string | null;
  userId: string | null;
  onMessagesChange: (nombre: number) => void;
}) {
  const { messages, sendMessage, regenerate, clearError, status, stop, error } = useChat({
    id: conversationId,
    messages: initialMessages,
  });
  const initialQuerySent = useRef(false);

  useEffect(() => {
    saveConversation(userId, conversationId, messages).then(() => onMessagesChange(messages.length));
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

  // Panneau des plantes : s'ouvre de lui-même une fois la réponse terminée,
  // sur chaque NOUVELLE réponse qui propose des plantes (pas sur une
  // conversation rouverte), sur grand écran seulement — sur téléphone il cacherait la réponse en train de
  // s'écrire, la carte sous la réponse suffit.
  const [panneauId, setPanneauId] = useState<string | null>(null);
  const derniereAvecPlantes = [...messages].reverse().find((m) => plantesProposees(m).length > 0)?.id ?? null;
  const dejaVue = useRef(derniereAvecPlantes);
  useEffect(() => {
    if (isBusy || !derniereAvecPlantes || derniereAvecPlantes === dejaVue.current) return;
    dejaVue.current = derniereAvecPlantes;
    const grandEcran = window.matchMedia("(min-width: 1024px)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (grandEcran) setPanneauId(derniereAvecPlantes);
  }, [derniereAvecPlantes, isBusy]);
  const messagePanneau = panneauId ? messages.find((m) => m.id === panneauId) : undefined;
  const usagesPanneau = messagePanneau ? plantesProposees(messagePanneau) : [];

  const handleSend = ({ text, files }: { text: string; files?: FileList }) => {
    sendMessage({ text, files });
  };

  const handleExampleClick = (text: string) => {
    sendMessage({ text });
  };

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ChatMessages
            messages={messages}
            status={status}
            onExampleClick={handleExampleClick}
            panneauId={panneauId}
            onBasculerPanneau={(id) => setPanneauId((actuel) => (actuel === id ? null : id))}
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
        </div>
        <ChatInput onSend={handleSend} onStop={stop} disabled={isBusy} />
      </div>
      {usagesPanneau.length > 0 && <PanneauPlantes usages={usagesPanneau} onFermer={() => setPanneauId(null)} />}
    </div>
  );
}

// La conversation affichée vient de l'URL : ?c=<id> pour reprendre une
// conversation (barre latérale), ?nouveau=<horodatage> pour en commencer une,
// ?q=<question> pour une question venue de l'accueil.
function ChatPageContenu() {
  const { user } = useAuth();
  const params = useSearchParams();
  const c = params.get("c");
  const nouveau = params.get("nouveau");
  const q = params.get("q");

  const [conversations, setConversations] = useState<StoredConversation[] | null>(null);
  const [chargement, setChargement] = useState(true);
  // La conversation affichée est un état de la page, pas une valeur
  // recalculée depuis l'URL : réécrire l'URL (?c=) au premier message ne
  // doit ni changer d'identifiant ni remonter la session en cours.
  const [{ activeId, creees }, setConv] = useState(() => {
    const id = c ?? newConversationId();
    // Conversations créées dans cet onglet : déjà en mémoire, jamais de
    // chargement pour elles.
    return { activeId: id, creees: new Set<string>(c ? [] : [id]) };
  });

  // Navigation venue de l'extérieur : une conversation de la barre
  // latérale (?c=), ou « Nouvelle conversation » (?nouveau=, horodaté à
  // chaque clic).
  // Le premier passage est ignoré : l'état initial reflète déjà l'URL (une
  // question venue de l'accueil ne doit pas partir dans deux sessions).
  const premierPassage = useRef(true);
  useEffect(() => {
    if (premierPassage.current) {
      premierPassage.current = false;
      return;
    }
    if (c) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConv((e) => (e.activeId === c ? e : { ...e, activeId: c }));
      return;
    }
    const id = newConversationId();
    setConv((e) => ({ activeId: id, creees: new Set(e.creees).add(id) }));
  }, [c, nouveau]);

  // Rechargé quand on ouvre une conversation existante, pour démarrer avec
  // ses derniers messages.
  useEffect(() => {
    let actif = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChargement(true);
    loadConversations(user?.id ?? null).then((liste) => {
      if (!actif) return;
      setConversations(liste);
      setChargement(false);
    });
    return () => {
      actif = false;
    };
  }, [user?.id, c]);

  // Après chaque enregistrement : la barre latérale rafraîchit ses récents ;
  // au premier message, l'URL prend l'identifiant (recharger la page garde
  // la conversation).
  const handleMessagesChange = useCallback(
    (nombre: number) => {
      if (nombre === 0) return;
      window.dispatchEvent(new Event(EVENEMENT_CONVERSATIONS));
      if (new URLSearchParams(window.location.search).get("c") !== activeId) {
        window.history.replaceState(null, "", `/chat?c=${activeId}`);
      }
    },
    [activeId]
  );

  if (!creees.has(activeId) && chargement) {
    return <p className="py-16 text-center text-sm text-neutral-500">Chargement de la conversation…</p>;
  }
  const active = conversations?.find((conv) => conv.id === activeId);

  return (
    <div className="flex h-full flex-col">
      <ChatSession
        key={activeId}
        conversationId={activeId}
        initialMessages={active?.messages ?? []}
        initialQuery={creees.has(activeId) ? q : null}
        userId={user?.id ?? null}
        onMessagesChange={handleMessagesChange}
      />
      <DisclaimerBanner />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatPageContenu />
    </Suspense>
  );
}

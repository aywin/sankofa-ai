"use client";

import { useChat } from "@ai-sdk/react";
import { DisclaimerBanner } from "@/components/chat/DisclaimerBanner";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";

export default function Home() {
  const { messages, sendMessage, status, error } = useChat();

  const isBusy = status === "submitted" || status === "streaming";

  const handleSend = (text: string) => {
    sendMessage({ text });
  };

  return (
    <div className="flex h-dvh flex-col">
      <header className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <h1 className="mx-auto max-w-2xl text-lg font-semibold text-emerald-700 dark:text-emerald-400">
          Lafi IA
        </h1>
      </header>

      <DisclaimerBanner />

      <main className="flex-1 overflow-y-auto">
        <ChatMessages
          messages={messages}
          status={status}
          onExampleClick={handleSend}
        />
        {error && (
          <div className="mx-auto max-w-2xl px-4 pb-4">
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              Une erreur est survenue. Réessaie dans un instant.
            </p>
          </div>
        )}
      </main>

      <ChatInput onSend={handleSend} disabled={isBusy} />
    </div>
  );
}

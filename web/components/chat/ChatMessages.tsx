"use client";

import ReactMarkdown from "react-markdown";
import type { UIMessage } from "ai";
import { SourcesBadge } from "./SourcesBadge";

const EXEMPLES = [
  "J'ai de la fièvre et des frissons depuis 2 jours",
  "Comment soigner une plaie qui commence à s'infecter ?",
  "Je n'arrive pas à dormir depuis plusieurs nuits",
  "Quelle plante pour faire baisser la tension ?",
];

function isSearching(message: UIMessage) {
  return message.parts.some(
    (p) =>
      p.type.startsWith("tool-") &&
      "state" in p &&
      (p.state === "input-streaming" || p.state === "input-available")
  );
}

export function ChatMessages({
  messages,
  status,
  onExampleClick,
}: {
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
  onExampleClick: (text: string) => void;
}) {
  if (messages.length === 0) {
    return (
      <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
          Décris un symptôme ou une maladie pour découvrir les usages
          traditionnels documentés.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {EXEMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => onExampleClick(ex)}
              className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
      {messages.map((message) => {
        const isUser = message.role === "user";
        const textParts = message.parts.filter((p) => p.type === "text");
        const toolParts = message.parts.filter((p) => p.type.startsWith("tool-"));

        return (
          <div
            key={message.id}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                isUser
                  ? "bg-emerald-600 text-white"
                  : "bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
              }`}
            >
              {textParts.length === 0 && isSearching(message) && (
                <p className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  Recherche dans la base de plantes…
                </p>
              )}

              {textParts.map((part, i) =>
                isUser ? (
                  <p key={i} className="whitespace-pre-wrap text-sm">
                    {part.text}
                  </p>
                ) : (
                  <div
                    key={i}
                    className="prose prose-sm prose-neutral dark:prose-invert max-w-none prose-p:my-1.5 prose-headings:mt-3 prose-headings:mb-1.5"
                  >
                    <ReactMarkdown>{part.text}</ReactMarkdown>
                  </div>
                )
              )}

              {!isUser && <SourcesBadge parts={toolParts} />}
            </div>
          </div>
        );
      })}

      {status === "submitted" && (
        <div className="flex justify-start">
          <div className="rounded-2xl bg-neutral-100 px-4 py-2.5 dark:bg-neutral-900">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          </div>
        </div>
      )}
    </div>
  );
}

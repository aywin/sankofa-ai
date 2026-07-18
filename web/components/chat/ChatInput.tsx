"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowUpIcon, MicIcon, PlusIcon, StopIcon } from "./icons";

interface SpeechRecognitionEventLike extends Event {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

function createRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as SpeechRecognitionWindow;
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = "fr-FR";
  recognition.continuous = false;
  recognition.interimResults = false;
  return recognition;
}

function speechRecognitionAvailable(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as SpeechRecognitionWindow;
  return !!(w.SpeechRecognition ?? w.webkitSpeechRecognition);
}

export function ChatInput({
  onSend,
  onStop,
  disabled,
}: {
  onSend: (input: { text: string; files?: FileList }) => void;
  onStop: () => void;
  disabled: boolean;
}) {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  // false au rendu serveur ET au premier rendu client (évite un mismatch
  // d'hydratation) ; l'effet ci-dessous l'active juste après le montage,
  // une fois qu'on sait vraiment si le navigateur supporte l'API.
  const [speechSupported, setSpeechSupported] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    if (!speechRecognitionAvailable()) return;
    const recognition = createRecognition();
    if (!recognition) return;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    recognitionRef.current = recognition;
    // Capacité détectable seulement côté client : démarrer à false évite le
    // mismatch d'hydratation, ce setState post-montage active le micro ensuite.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSpeechSupported(true);
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const previewUrl = useMemo(
    () => (pendingFile ? URL.createObjectURL(pendingFile) : null),
    [pendingFile]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const toggleRecording = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    e.target.value = "";
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if ((!trimmed && !pendingFile) || disabled) return;

    let files: FileList | undefined;
    if (pendingFile) {
      const dt = new DataTransfer();
      dt.items.add(pendingFile);
      files = dt.files;
    }

    onSend({ text: trimmed, files });
    setInput("");
    setPendingFile(null);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl px-4 pb-2">
      {pendingFile && previewUrl && (
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-neutral-100 p-2 dark:bg-neutral-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
          <span className="flex-1 truncate text-xs text-neutral-500 dark:text-neutral-400">
            {pendingFile.name}
          </span>
          <button
            type="button"
            onClick={() => setPendingFile(null)}
            className="text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            Retirer
          </button>
        </div>
      )}

      <div className="flex items-end gap-1 rounded-3xl border border-neutral-200 bg-white p-1.5 pl-2 shadow-sm transition focus-within:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-900">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Ajouter une photo (plante ou peau)"
          title="Ajouter une photo (plante ou peau)"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        >
          <PlusIcon />
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Décris tes symptômes, ou envoie une photo…"
          rows={1}
          disabled={disabled}
          className="max-h-40 flex-1 resize-none bg-transparent px-1 py-1.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 disabled:opacity-60 dark:text-neutral-100"
        />

        {speechSupported && (
          <button
            type="button"
            onClick={toggleRecording}
            aria-label={isRecording ? "Arrêter la dictée" : "Dicter le message"}
            title={isRecording ? "Arrêter la dictée" : "Dicter le message"}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
              isRecording
                ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            <MicIcon />
          </button>
        )}

        <button
          type={disabled ? "button" : "submit"}
          onClick={disabled ? onStop : undefined}
          disabled={!disabled && !input.trim() && !pendingFile}
          aria-label={disabled ? "Arrêter la génération" : "Envoyer"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {disabled ? <StopIcon /> : <ArrowUpIcon />}
        </button>
      </div>
    </form>
  );
}

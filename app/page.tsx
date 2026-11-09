"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Olá! Sou o assistente do Tozato AI Core. Escolha um tema abaixo ou digite sua pergunta." }
  ]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const addFiles = (incoming: FileList | File[]) => {
    setFiles((current) => {
      const next = [...current];
      for (const file of Array.from(incoming)) {
        if (next.length >= 5) break;
        if (!next.some((item) => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified)) next.push(file);
      }
      return next;
    });
  };

  const stopMediaStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const toggleRecording = async () => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMessages((prev) => [...prev, { role: "assistant", content: "A gravação de áudio não é suportada neste navegador." }]);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const supportedMime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((mime) => MediaRecorder.isTypeSupported(mime));
      const recorder = supportedMime ? new MediaRecorder(stream, { mimeType: supportedMime }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.addEventListener("dataavailable", (event: BlobEvent) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      });
      recorder.addEventListener("stop", () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const extension = mimeType.includes("mp4") || mimeType.includes("m4a") ? "m4a" : "webm";
        const audioFile = new File(chunksRef.current, `gravacao-${Date.now()}.${extension}`, { type: mimeType });
        if (audioFile.size > 0) addFiles([audioFile]);
        chunksRef.current = [];
        stopMediaStream();
        recorderRef.current = null;
        setRecording(false);
      }, { once: true });
      recorder.addEventListener("error", () => {
        stopMediaStream();
        recorderRef.current = null;
        setRecording(false);
        setMessages((prev) => [...prev, { role: "assistant", content: "Ocorreu uma falha durante a gravação do áudio." }]);
      }, { once: true });
      recorder.start();
      setRecording(true);
    } catch (error) {
      stopMediaStream();
      const message = error instanceof Error ? error.message : "Não foi possível acessar o microfone.";
      setMessages((prev) => [...prev, { role: "assistant", content: `Falha ao iniciar a gravação: ${message}` }]);
    }
  };

  useEffect(() => {
    return () => {
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      stopMediaStream();
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!input.trim() && files.length === 0) || loading || recording) return;
    const userMessage = input.trim();
    const submittedFiles = files;
    const displayMessage = submittedFiles.length
      ? userMessage + (userMessage ? "\n" : "") + "Anexos: " + submittedFiles.map((file) => file.name).join(", ")
      : userMessage;
    const history = messages.slice(-10).map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      text: message.content,
    }));
    setInput("");
    setFiles([]);
    setMessages((prev) => [...prev, { role: "user", content: displayMessage }]);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("message", userMessage);
      formData.append("history", JSON.stringify(history));
      submittedFiles.forEach((file) => formData.append("files", file, file.name));
      const response = await fetch("/api/chat", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha na comunicação com a API.");
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer || data.reply || "O assistente não retornou uma resposta." }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao comunicar com a API.";
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1>Tozato AI Core - Assistente IA</h1>
      <div
        style={{ border: "1px solid #ccc", padding: "1rem", minHeight: "300px", maxHeight: "400px", overflowY: "scroll", marginBottom: "1rem", borderRadius: "8px" }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files); }}
      >
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: "1rem", textAlign: msg.role === "user" ? "right" : "left" }}>
            <span style={{ background: msg.role === "user" ? "#0070f3" : "#eaeaea", color: msg.role === "user" ? "#fff" : "#000", padding: "0.5rem 1rem", borderRadius: "8px", display: "inline-block", whiteSpace: "pre-wrap" }}>
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <p style={{ fontStyle: "italic", color: "#666" }}>Assistente está digitando...</p>}
        {recording && <p role="status" style={{ fontStyle: "italic", color: "#c00" }}>Gravando áudio...</p>}
      </div>
      <form
        onSubmit={handleSubmit}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files); }}
        style={{ display: "flex", gap: "0.5rem" }}
      >
        <input
          ref={fileInput}
          type="file"
          multiple
          accept="image/*,audio/*,video/*,application/pdf,text/*,.csv,.json,.md,.log"
          style={{ display: "none" }}
          onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.target.value = ""; }}
        />
        <div style={{ position: "relative", flex: 1, minWidth: 0, display: "flex" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(event) => {
              if (event.altKey && event.key.toLowerCase() === "a") { event.preventDefault(); fileInput.current?.click(); }
              if (event.altKey && event.key.toLowerCase() === "m") { event.preventDefault(); void toggleRecording(); }
            }}
            placeholder="Digite sua mensagem..."
            style={{ flex: 1, padding: "0.75rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <button
            type="button"
            aria-label={recording ? "Parar gravação" : "Iniciar gravação"}
            title={recording ? "Parar gravação" : "Gravar áudio"}
            aria-pressed={recording}
            onClick={() => void toggleRecording()}
            disabled={loading}
            style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", border: 0, background: "transparent", color: recording ? "#c00" : "#555", padding: "0.25rem", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {recording ? <rect x="6" y="6" width="12" height="12" rx="2" /> : <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8" /></>}
            </svg>
          </button>
        </div>
        <button type="submit" disabled={loading || recording} style={{ padding: "0.75rem 1.5rem", background: "#0070f3", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Enviar
        </button>
      </form>
    </main>
  );
}

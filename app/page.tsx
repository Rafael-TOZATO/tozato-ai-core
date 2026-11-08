"use client";

import { useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Olá! Sou o assistente do Tozato Dev Hub. Escolha um tema abaixo ou digite sua pergunta." }
  ]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | File[]) => {
    setFiles((current) => {
      const next = [...current];
      for (const file of Array.from(incoming)) {
        if (next.length >= 5) break;
        if (!next.some((item) => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified)) {
          next.push(file);
        }
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && files.length === 0) || loading) return;

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

      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

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
      <h1>Tozato Dev Hub - Assistente IA</h1>

      <div
        style={{ border: "1px solid #ccc", padding: "1rem", minHeight: "300px", maxHeight: "400px", overflowY: "scroll", marginBottom: "1rem", borderRadius: "8px" }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
      >
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: "1rem", textAlign: msg.role === "user" ? "right" : "left" }}>
            <span style={{ background: msg.role === "user" ? "#0070f3" : "#eaeaea", color: msg.role === "user" ? "#fff" : "#000", padding: "0.5rem 1rem", borderRadius: "8px", display: "inline-block", whiteSpace: "pre-wrap" }}>
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <p style={{ fontStyle: "italic", color: "#666" }}>Assistente está digitando...</p>}
      </div>

      <form
        onSubmit={handleSubmit}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
        style={{ display: "flex", gap: "0.5rem" }}
      >
        <input
          ref={fileInput}
          type="file"
          multiple
          accept="image/*,audio/*,video/*,application/pdf,text/*,.csv,.json,.md,.log"
          style={{ display: "none" }}
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(event) => {
            if (event.altKey && event.key.toLowerCase() === "a") {
              event.preventDefault();
              fileInput.current?.click();
            }
          }}
          placeholder="Digite sua mensagem..."
          style={{ flex: 1, padding: "0.75rem", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button type="submit" style={{ padding: "0.75rem 1.5rem", background: "#0070f3", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Enviar
        </button>
      </form>
    </main>
  );
}

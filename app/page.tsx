"use client";

import { useState } from "react";

export default function Page() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Olá! Sou o assistente do Tozato Dev Hub. Escolha um tema abaixo ou digite sua pergunta." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha na API.");
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer || data.reply || data.output || "Resposta recebida." }]);
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
      
      <div style={{ border: "1px solid #ccc", padding: "1rem", minHeight: "300px", maxHeight: "400px", overflowY: "scroll", marginBottom: "1rem", borderRadius: "8px" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: "1rem", textAlign: msg.role === "user" ? "right" : "left" }}>
            <span style={{ background: msg.role === "user" ? "#0070f3" : "#eaeaea", color: msg.role === "user" ? "#fff" : "#000", padding: "0.5rem 1rem", borderRadius: "8px", display: "inline-block" }}>
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <p style={{ fontStyle: "italic", color: "#666" }}>Assistente está digitando...</p>}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
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

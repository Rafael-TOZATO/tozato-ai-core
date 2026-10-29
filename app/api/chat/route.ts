import { NextResponse } from "next/server"

const MAX_MESSAGE_LENGTH = 1000
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434/v1"
const systemPrompt = `Você representa o Tozato Dev Hub. Responda em português do Brasil, de forma objetiva, apenas sobre os projetos, tecnologias e artigos do perfil. Não invente informações. Se a pergunta fugir desse escopo, diga brevemente que só pode ajudar com esses temas.`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const message = typeof body?.message === "string" ? body.message.trim() : ""

    if (!message) return NextResponse.json({ error: "A mensagem não pode ficar vazia." }, { status: 400 })
    if (message.length > MAX_MESSAGE_LENGTH) return NextResponse.json({ error: "A mensagem excede o limite permitido." }, { status: 413 })

    const response = await fetch(`${OLLAMA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3.5:9b",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: message }],
        temperature: 0.2,
        max_tokens: 300,
      }),
    })

    if (!response.ok) return NextResponse.json({ error: "Ollama não está disponível. Inicie o servidor local." }, { status: 503 })
    const data = await response.json()
    const answer = data?.choices?.[0]?.message?.content?.trim()
    if (!answer) return NextResponse.json({ error: "O assistente não retornou uma resposta." }, { status: 502 })
    return NextResponse.json({ answer })
  } catch {
    return NextResponse.json({ error: "Não foi possível conectar ao Ollama local." }, { status: 503 })
  }
}

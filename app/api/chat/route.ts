import { NextResponse } from "next/server"

const MAX_MESSAGE_LENGTH = 1000
const systemPrompt = `Você representa o Tozato Dev Hub. Responda em português do Brasil, de forma objetiva, apenas sobre os projetos, tecnologias e artigos do perfil. Não invente informações. Se a pergunta fugir desse escopo, diga brevemente que só pode ajudar com esses temas.`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const message = typeof body?.message === "string" ? body.message.trim() : ""

    if (!message) {
      return NextResponse.json({ error: "A mensagem não pode ficar vazia." }, { status: 400 })
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: "A mensagem excede o limite permitido." }, { status: 413 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Serviço de IA indisponível." }, { status: 503 })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: message }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 300 },
        }),
      },
    )

    if (!response.ok) {
      return NextResponse.json({ error: "Não foi possível consultar o assistente." }, { status: 502 })
    }

    const data = await response.json()
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!answer) {
      return NextResponse.json({ error: "O assistente não retornou uma resposta." }, { status: 502 })
    }

    return NextResponse.json({ answer })
  } catch {
    return NextResponse.json({ error: "Não foi possível processar a mensagem." }, { status: 400 })
  }
}

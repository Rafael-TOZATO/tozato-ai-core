import { NextResponse } from "next/server"

const MAX_MESSAGE_LENGTH = 1000
const MAX_FILES = 5
const MAX_FILE_BYTES = 10 * 1024 * 1024
const MAX_TEXT_CHARS = 6000
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434/v1"
// Defina OLLAMA_VISION=true somente se o modelo configurado aceitar imagens.
const VISION_ENABLED = process.env.OLLAMA_VISION === "true"
const systemPrompt = `Você representa o Tozato Dev Hub. Responda em português do Brasil, de forma objetiva, apenas sobre os projetos, tecnologias e artigos do perfil. Não invente informações. Se a pergunta fugir desse escopo, diga brevemente que só pode ajudar com esses temas.`

const TEXT_TYPES = /^(text\/|application\/(json|csv|xml))/
const TEXT_EXT = /\.(txt|md|csv|json|log)$/i

type Part = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }

async function readInput(request: Request): Promise<{ message: string; files: File[] }> {
  const contentType = request.headers.get("content-type") || ""
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData()
    const raw = form.get("message")
    const files = form.getAll("files").filter((f): f is File => typeof f !== "string")
    return { message: typeof raw === "string" ? raw.trim() : "", files }
  }
  const body = await request.json()
  return { message: typeof body?.message === "string" ? body.message.trim() : "", files: [] }
}

async function buildContent(message: string, files: File[]): Promise<string | Part[]> {
  if (!files.length) return message
  const parts: Part[] = []
  let text = message
  for (const file of files) {
    if (TEXT_TYPES.test(file.type) || TEXT_EXT.test(file.name)) {
      const content = (await file.text()).slice(0, MAX_TEXT_CHARS)
      text += `\n\n[Arquivo anexado: ${file.name}]\n${content}`
    } else if (file.type.startsWith("image/") && VISION_ENABLED) {
      const base64 = Buffer.from(await file.arrayBuffer()).toString("base64")
      parts.push({ type: "image_url", image_url: { url: `data:${file.type};base64,${base64}` } })
    } else {
      text += `\n\n[Anexo recebido: ${file.name} (${file.type || "tipo desconhecido"}). O conteúdo não pôde ser analisado por este modelo.]`
    }
  }
  return parts.length ? [{ type: "text", text: text || "Analise o anexo." }, ...parts] : text
}

export async function POST(request: Request) {
  try {
    const { message, files } = await readInput(request)

    if (!message && !files.length) return NextResponse.json({ error: "A mensagem não pode ficar vazia." }, { status: 400 })
    if (message.length > MAX_MESSAGE_LENGTH) return NextResponse.json({ error: "A mensagem excede o limite permitido." }, { status: 413 })
    if (files.length > MAX_FILES) return NextResponse.json({ error: `Envie no máximo ${MAX_FILES} anexos.` }, { status: 413 })
    if (files.some((f) => f.size > MAX_FILE_BYTES)) return NextResponse.json({ error: "Um dos anexos excede 10 MB." }, { status: 413 })

    const content = await buildContent(message, files)

    const response = await fetch(`${OLLAMA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3.5:9b",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content }],
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

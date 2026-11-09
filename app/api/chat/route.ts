import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 60

const MAX_MESSAGE_LENGTH = 8000
const MAX_FILES = 5
const MAX_TOTAL_BYTES = 4_000_000 // limite de corpo das Functions da Vercel é 4,5 MB
const MAX_TEXT_CHARS = 20000
const MAX_HISTORY = 10
const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash"
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

const SYSTEM_PROMPT =
  "Você é o assistente do Tozato Dev Hub. Responda em português do Brasil, de forma clara, precisa e objetiva, sobre qualquer assunto. Quando receber áudio, transcreva internamente e responda ao conteúdo falado."

const TEXT_TYPES = /^(text\/|application\/(json|csv|xml))/
const TEXT_EXT = /\.(txt|md|csv|json|log)$/i
const INLINE_TYPES = /^(image\/|audio\/|video\/|application\/pdf$)/

type GPart = { text: string } | { inlineData: { mimeType: string; data: string } }
type HistoryItem = { role: "user" | "model"; text: string }

function inferMimeType(file: File): string {
  const extension = file.name.split(".").pop()?.toLowerCase() || ""
  if (extension === "m4a") return "audio/m4a"

  const supplied = (file.type || "").split(";")[0].toLowerCase()
  if (supplied && supplied !== "application/octet-stream") return supplied
  const knownTypes: Record<string, string> = {
    txt: "text/plain", md: "text/markdown", csv: "text/csv", json: "application/json", log: "text/plain",
    pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif",
    webp: "image/webp", mp3: "audio/mpeg", wav: "audio/wav", m4a: "audio/m4a", aac: "audio/aac",
    ogg: "audio/ogg", oga: "audio/ogg", flac: "audio/flac", webm: "audio/webm", mp4: "video/mp4",
    mov: "video/quicktime", aiff: "audio/aiff",
  }
  return knownTypes[extension] || supplied
}

function parseHistory(raw: unknown): HistoryItem[] {
  let value: unknown = raw
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw)
    } catch {
      return []
    }
  }
  if (!Array.isArray(value)) return []
  return value
    .filter(
      (h): h is HistoryItem =>
        !!h &&
        (h.role === "user" || h.role === "model") &&
        typeof h.text === "string" &&
        h.text.length > 0,
    )
    .slice(-MAX_HISTORY)
    .map((h) => ({ role: h.role, text: h.text.slice(0, MAX_MESSAGE_LENGTH) }))
}

async function readInput(request: Request) {
  const contentType = request.headers.get("content-type") || ""
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData()
    const raw = form.get("message")
    const files = [...form.getAll("files"), ...form.getAll("file"), ...form.getAll("audio")].filter((f): f is File => typeof f !== "string")
    return {
      message: typeof raw === "string" ? raw.trim() : "",
      files,
      history: parseHistory(form.get("history")),
    }
  }
  const body = await request.json()
  return {
    message: typeof body?.message === "string" ? body.message.trim() : "",
    files: [] as File[],
    history: parseHistory(body?.history),
  }
}

async function buildParts(message: string, files: File[]): Promise<GPart[]> {
  const parts: GPart[] = []
  let text = message
  for (const file of files) {
    const mime = inferMimeType(file)
    if (TEXT_TYPES.test(mime) || TEXT_EXT.test(file.name)) {
      const content = (await file.text()).slice(0, MAX_TEXT_CHARS)
      text += `\n\n[Arquivo: ${file.name}]\n${content}`
    } else if (INLINE_TYPES.test(mime)) {
      const data = Buffer.from(await file.arrayBuffer()).toString("base64")
      parts.push({ inlineData: { mimeType: mime, data } })
    } else {
      text += `\n\n[Anexo não suportado: ${file.name} (${mime || "tipo desconhecido"})]`
    }
  }
  const hasAudio = parts.some((p) => "inlineData" in p && p.inlineData.mimeType.startsWith("audio/"))
  const fallback = hasAudio ? "Transcreva o áudio e responda ao conteúdo." : "Analise o anexo."
  return [{ text: text.trim() || fallback }, ...parts]
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY não configurada no ambiente." }, { status: 500 })
  }

  try {
    const { message, files, history } = await readInput(request)

    if (!message && !files.length) return NextResponse.json({ error: "A mensagem não pode ficar vazia." }, { status: 400 })
    if (message.length > MAX_MESSAGE_LENGTH) return NextResponse.json({ error: "A mensagem excede o limite permitido." }, { status: 413 })
    if (files.length > MAX_FILES) return NextResponse.json({ error: `Envie no máximo ${MAX_FILES} anexos.` }, { status: 413 })
    if (files.reduce((s, f) => s + f.size, 0) > MAX_TOTAL_BYTES) {
      return NextResponse.json({ error: "Os anexos excedem 4 MB no total." }, { status: 413 })
    }

    const parts = await buildParts(message, files)
    const contents = [
      ...history.map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: "user", parts },
    ]

    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      }),
    })

    if (!response.ok) {
      console.error("Gemini error", response.status, await response.text())
      return NextResponse.json({ error: "Falha na comunicação com o Gemini." }, { status: 502 })
    }

    const data = await response.json()
    const answer: string | undefined = data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("")
      .trim()

    if (!answer) {
      const reason = data?.promptFeedback?.blockReason
      return NextResponse.json(
        { error: reason ? `Resposta bloqueada pelo Gemini (${reason}).` : "O assistente não retornou uma resposta." },
        { status: 502 },
      )
    }
    return NextResponse.json({ answer, reply: answer })
  } catch (err) {
    console.error("chat route error", err)
    return NextResponse.json({ error: "Erro interno ao processar a mensagem." }, { status: 500 })
  }
}

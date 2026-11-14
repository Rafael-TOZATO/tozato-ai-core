import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 60

const MAX_MESSAGE_LENGTH = 8000
const MAX_FILES = 5
const MAX_TOTAL_BYTES = 4_000_000
const MAX_REQUEST_BYTES = 4_400_000
const MAX_TEXT_CHARS_PER_FILE = 20_000
const MAX_TOTAL_TEXT_CHARS = 40_000
const MAX_HISTORY = 10
const MAX_HISTORY_ITEM_CHARS = 4000
const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash"
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`
const UPSTREAM_TIMEOUT_MS = 30_000

const SYSTEM_PROMPT =
  "Você é o assistente de IA do Tozato AI Core. Responda diretamente à pergunta ou execute a tarefa solicitada, em português do Brasil, com conteúdo específico, correto e útil. Não descreva etapas genéricas de análise, não reformule a pergunta como resposta e não use frases vagas como \"vou analisar por etapas\". Se a solicitação for objetiva, comece pela resposta objetiva e depois apresente a justificativa necessária. Considere integralmente o texto e todos os anexos recebidos. Para áudio, identifique o idioma, transcreva internamente o conteúdo falado e responda à intenção do usuário; nunca diga que o processamento ficou local ou que não pode acessar o anexo quando ele estiver presente no conteúdo da solicitação. Se o áudio estiver inaudível ou incompatível, informe precisamente essa limitação."

const TEXT_TYPES = /^(text\/|application\/(json|csv|xml))/
const TEXT_EXT = /\.(txt|md|csv|json|log)$/i
const INLINE_TYPES = /^(image\/|audio\/|video\/|application\/pdf$)/
const MODEL_NAME_PATTERN = /^[a-zA-Z0-9._-]+$/
const ALLOWED_ORIGINS = new Set([
  "https://tozato-ai-core.vercel.app",
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
].filter(Boolean))

type GPart = { text: string } | { inlineData: { mimeType: string; data: string } }
type HistoryItem = { role: "user" | "model"; text: string }

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  })
}

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
      (item): item is HistoryItem =>
        !!item &&
        (item.role === "user" || item.role === "model") &&
        typeof item.text === "string" &&
        item.text.length > 0,
    )
    .slice(-MAX_HISTORY)
    .map((item) => ({ role: item.role, text: item.text.slice(0, MAX_HISTORY_ITEM_CHARS) }))
}

class RequestBodyTooLargeError extends Error {}

async function readBoundedBody(request: Request): Promise<Buffer> {
  const reader = request.body?.getReader()
  if (!reader) return Buffer.alloc(0)

  const chunks: Buffer[] = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      totalBytes += value.byteLength
      if (totalBytes > MAX_REQUEST_BYTES) {
        await reader.cancel().catch(() => undefined)
        throw new RequestBodyTooLargeError()
      }

      chunks.push(Buffer.from(value))
    }
  } finally {
    reader.releaseLock()
  }

  return Buffer.concat(chunks, totalBytes)
}

async function readInput(contentType: string, body: Buffer) {
  if (contentType.includes("multipart/form-data")) {
    const form = await new Response(new Uint8Array(body), { headers: { "Content-Type": contentType } }).formData()
    const raw = form.get("message")
    const files = [...form.getAll("files"), ...form.getAll("file"), ...form.getAll("audio")]
      .filter((file): file is File => typeof file !== "string")

    return {
      message: typeof raw === "string" ? raw.trim() : "",
      files,
      history: parseHistory(form.get("history")),
    }
  }

  const parsedBody: unknown = JSON.parse(body.toString("utf8"))
  if (!parsedBody || typeof parsedBody !== "object" || Array.isArray(parsedBody)) {
    throw new TypeError("Invalid request body")
  }

  const bodyObject = parsedBody as Record<string, unknown>
  return {
    message: typeof bodyObject.message === "string" ? bodyObject.message.trim() : "",
    files: [] as File[],
    history: parseHistory(bodyObject.history),
  }
}

async function buildParts(message: string, files: File[]): Promise<GPart[]> {
  const parts: GPart[] = []
  let text = message
  let totalTextChars = 0

  for (const file of files) {
    const mime = inferMimeType(file)
    const safeName = file.name.replace(/[\u0000-\u001f\u007f]/g, "_").slice(0, 160)

    if (TEXT_TYPES.test(mime) || TEXT_EXT.test(file.name)) {
      const remaining = Math.max(0, MAX_TOTAL_TEXT_CHARS - totalTextChars)
      const content = (await file.text()).slice(0, Math.min(MAX_TEXT_CHARS_PER_FILE, remaining))
      totalTextChars += content.length
      text += `\n\n[Arquivo: ${safeName}]\n${content}`
    } else if (INLINE_TYPES.test(mime)) {
      const data = Buffer.from(await file.arrayBuffer()).toString("base64")
      parts.push({ inlineData: { mimeType: mime, data } })
    } else {
      text += `\n\n[Anexo não suportado: ${safeName} (${mime || "tipo desconhecido"})]`
    }
  }

  const hasAudio = parts.some((part) => "inlineData" in part && part.inlineData.mimeType.startsWith("audio/"))
  const fallback = hasAudio ? "Transcreva o áudio e responda ao conteúdo." : "Analise o anexo."
  return [{ text: text.trim() || fallback }, ...parts]
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return jsonResponse({ error: "Serviço de IA temporariamente indisponível." }, 503)
  }

  const contentLength = request.headers.get("content-length")
  if (contentLength !== null) {
    const parsedLength = Number(contentLength)
    if (!Number.isSafeInteger(parsedLength) || parsedLength < 0) {
      return jsonResponse({ error: "Cabeçalho de tamanho da requisição inválido." }, 400)
    }
    if (parsedLength > MAX_REQUEST_BYTES) {
      return jsonResponse({ error: "A requisição excede o limite de 4,4 MB." }, 413)
    }
  }

  const origin = request.headers.get("origin")
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return jsonResponse({ error: "Origem da requisição não autorizada." }, 403)
  }

  const contentType = request.headers.get("content-type") || ""
  if (!contentType.includes("multipart/form-data") && !contentType.includes("application/json")) {
    return jsonResponse({ error: "Tipo de conteúdo não suportado." }, 415)
  }

  let requestBody: Buffer
  try {
    requestBody = await readBoundedBody(request)
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return jsonResponse({ error: "A requisição excede o limite de 4,4 MB." }, 413)
    }
    return jsonResponse({ error: "Corpo da requisição inválido." }, 400)
  }

  try {
    if (!MODEL_NAME_PATTERN.test(MODEL)) {
      return jsonResponse({ error: "Configuração do serviço de IA inválida." }, 503)
    }

    let input: Awaited<ReturnType<typeof readInput>>
    try {
      input = await readInput(contentType, requestBody)
    } catch {
      return jsonResponse({ error: "Corpo da requisição inválido." }, 400)
    }

    const { message, files, history } = input

    if (!message && !files.length) return jsonResponse({ error: "A mensagem não pode ficar vazia." }, 400)
    if (message.length > MAX_MESSAGE_LENGTH) return jsonResponse({ error: "A mensagem excede o limite permitido." }, 413)
    if (files.length > MAX_FILES) return jsonResponse({ error: `Envie no máximo ${MAX_FILES} anexos.` }, 413)
    if (files.some((file) => file.size < 0) || files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_BYTES) {
      return jsonResponse({ error: "Os anexos excedem 4 MB no total." }, 413)
    }

    const parts = await buildParts(message, files)
    const contents = [
      ...history.map((item) => ({ role: item.role, parts: [{ text: item.text }] })),
      { role: "user", parts },
    ]

    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { maxOutputTokens: 2048 },
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })

    if (!response.ok) {
      console.error("Gemini upstream failure", response.status)
      const status = response.status === 429 ? 503 : 502
      return jsonResponse({ error: "Falha na comunicação com o serviço de IA." }, status)
    }

    let data: unknown
    try {
      data = await response.json()
    } catch {
      return jsonResponse({ error: "O serviço de IA retornou uma resposta inválida." }, 502)
    }

    const answer: string | undefined = (data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })
      ?.candidates?.[0]?.content?.parts
      ?.map((part) => typeof part.text === "string" ? part.text : "")
      .join("")
      .trim()

    if (!answer) {
      return jsonResponse({ error: "O assistente não retornou uma resposta utilizável." }, 502)
    }

    return jsonResponse({ answer, reply: answer })
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      return jsonResponse({ error: "O serviço de IA excedeu o tempo limite de resposta." }, 504)
    }
    console.error("chat route failure", error instanceof Error ? error.name : "UnknownError")
    return jsonResponse({ error: "Erro interno ao processar a mensagem." }, 500)
  }
}

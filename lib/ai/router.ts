import OpenAI from "openai";
import Groq from "groq-sdk";
import { QuizGenerationSchema } from "./schema";

// Try to import newer Google GenAI SDK if available
let GoogleGenAIClass: any = null;
let googleGenAIResolved = false;

async function resolveGoogleGenAI() {
  if (googleGenAIResolved) return GoogleGenAIClass;
  googleGenAIResolved = true;
  try {
    const mod = await import("@google/genai");
    const candidate =
      (mod as any).GoogleGenAI ??
      (mod as any).default?.GoogleGenAI ??
      (mod as any).default ??
      null;
    GoogleGenAIClass = typeof candidate === "function" ? candidate : null;
  } catch {
    GoogleGenAIClass = null;
  }
  return GoogleGenAIClass;
}

function extractText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((c: any) => (typeof c?.text === "string" ? c.text : ""))
      .join("");
  }
  return "";
}

function parseQuizPayload(raw: string) {
  const cleaned = raw.replace(/```json|```/gi, "").trim();
  const start = Math.min(
    ...["[", "{"]
      .map((ch) => cleaned.indexOf(ch))
      .filter((i) => i >= 0)
  );
  const payload = Number.isFinite(start) ? cleaned.slice(start) : cleaned;
  const parsed = JSON.parse(payload);
  const questions = Array.isArray(parsed) ? parsed : parsed?.questions ?? [];
  return QuizGenerationSchema.parse(questions);
}

function validateQuizQuality(questions: ReturnType<typeof parseQuizPayload>, expectedCount: number) {
  if (questions.length !== expectedCount) {
    throw new Error(
      `[AI ROUTER] Invalid quiz length: expected ${expectedCount}, got ${questions.length}`
    );
  }

  for (const [index, q] of questions.entries()) {
    const qNumber = index + 1;
    const normalizedOptions = q.options.map((opt) => opt.trim());
    const uniqueOptions = new Set(normalizedOptions.map((opt) => opt.toLowerCase()));

    if (uniqueOptions.size !== 4) {
      throw new Error(`[AI ROUTER] Q${qNumber} has duplicate options.`);
    }

    if (!normalizedOptions.includes(q.answer.trim())) {
      throw new Error(`[AI ROUTER] Q${qNumber} answer is not an exact option match.`);
    }

    for (const option of normalizedOptions) {
      const leaksNumericStat = /[:\-–—]\s*\d+(?:\.\d+)?\b/.test(option);
      if (leaksNumericStat) {
        throw new Error(
          `[AI ROUTER] Q${qNumber} option leaks stat value with entity: "${option}".`
        );
      }
    }
  }

  return questions;
}

function logProviderAttempt(provider: string, model: string, attempt: number, totalAttempts: number) {
  console.log(
    `[AI ROUTER] ▶ Provider=${provider} | Model=${model} | Attempt=${attempt}/${totalAttempts}`
  );
}

function logProviderSuccess(provider: string, model: string, count: number) {
  console.log(
    `[AI ROUTER] ✅ Provider=${provider} | Model=${model} | Generated=${count} questions`
  );
}

function getModelList(envName: string, fallback: string) {
  const raw = process.env[envName] ?? process.env[envName + "S"] ?? fallback;
  return String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Provider Selection logic: Priority + Fallback
export async function generateQuiz(count: number, hexSeed: string, difficulty: string) {
  const providers = ["gemini", "groq", "openrouter", "cloudflare"] as const;

  for (const provider of providers) {
    try {
      console.log(`[AI ROUTER] Attempting provider: ${provider}`);
      switch (provider) {
        case "gemini":
          return await geminiProvider(count, hexSeed, difficulty);
        case "groq":
          return await groqProvider(count, hexSeed, difficulty);
        case "openrouter":
          return await openrouterProvider(count, hexSeed, difficulty);
        case "cloudflare":
          return await cloudflareProvider(count, hexSeed, difficulty);
      }
    } catch (err: any) {
      const errorMsg = err?.message || err?.error?.message || String(err);
      console.error(`[AI ROUTER] ❌ Provider [${provider}] FAILED. Error: ${errorMsg}. Switching to next provider...`);
      continue;
    }
  }
  throw new Error("All AI providers failed. Check API keys and network.");
}

const SYSTEM_PROMPT = (count: number, hex: string, difficulty: string) => `
You are IPL StatWar's primary quiz generation engine.

MISSION:
- Generate exactly ${count} high-quality IPL MCQs with reliable, current, and unambiguous answers.
- Obscurity seed: ${hex}
- Difficulty: ${difficulty}

NON-NEGOTIABLE RULES:
1) ACCURACY & RECENCY
- Ground every fact in trustworthy public cricket data available via Google Search.
- Prefer facts stable through latest completed IPL season.
- Never invent facts, records, or player statistics.
- If a fact is volatile across seasons, pin the question to explicit context (season or time window).

2) QUESTION QUALITY
- Every question must test meaningful IPL knowledge, not generic cricket trivia.
- Question text must be self-contained and precise.
- Avoid ambiguous superlatives without context (e.g. "best", "greatest", "top").
- No trick questions, no opinion-based framing.

3) OPTIONS QUALITY (CRITICAL)
- Exactly 4 options.
- Exactly 1 unambiguously correct option.
- **TIE-BREAKER RULE:** If a record is shared by multiple entities (e.g., CSK and MI both have 5 IPL titles), DO NOT include the other tied entities in the wrong options. NEVER create a scenario where multiple options could be considered correct. Either frame the question so there is only one correct answer (e.g., "Which team was the FIRST to win 5 titles?"), or ensure the other tied entities are not listed in the options at all.
- Options must be mutually exclusive and plausible.
- Do NOT leak stat values inside options in "Name - number" or "Name: number" format.
- Do NOT put raw numeric-only options for player/stat identity questions.
- Keep options stylistically parallel.

4) ANSWER CONSISTENCY
- "answer" must be an exact string match to one option.
- Do not include explanations.
- Do not include references or citations in output.

5) OUTPUT CONTRACT
- Return ONLY valid JSON.
- Preferred shape: JSON array.
- Each object must match:
  {
    "type": "trivia" | "stat_puzzle",
    "question": string,
    "options": [string, string, string, string],
    "answer": string
  }

6) SAFETY AGAINST OUTDATED/POOR PROMPTS
- Never output outdated records when updated records exist.
- Never ask low-quality questions like:
  - "Who has the best economy in IPL?" with options containing "Player - value".
- Convert weak templates into strong context-bound questions.

FINAL CHECK BEFORE RETURNING:
- Count is exactly ${count}.
- Every answer exists in options.
- No duplicate options.
- No option contains leaked metric formatting (e.g., "Name - 7.8", "Name: 7.8").
- JSON parses without modification.
`;

// 1. GEMINI (Google) - Priority 1 with Google Search Grounding
async function geminiProvider(count: number, hex: string, difficulty: string) {
  const modelNames = getModelList(
    "GEMINI_MODEL",
    "gemini-2.5-flash,gemini-3-flash-preview"
  );
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const GoogleGenAI = await resolveGoogleGenAI();
  if (!GoogleGenAI) {
    throw new Error(
      "@google/genai is unavailable. Google-first routing requires @google/genai for grounding."
    );
  }

  const maxAttempts = 2;
  const ai = new GoogleGenAI({ apiKey });

  for (const modelName of modelNames) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      logProviderAttempt("gemini", modelName, attempt, maxAttempts);
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: SYSTEM_PROMPT(count, hex, difficulty),
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        const parsed = parseQuizPayload(response.text ?? "");
        const validated = validateQuizQuality(parsed, count);
        logProviderSuccess("gemini", modelName, validated.length);
        return validated;
      } catch (err: any) {
        const msg = err?.message || String(err);
        console.warn(`[AI ROUTER] Gemini model ${modelName} attempt ${attempt} failed: ${msg}`);
        if (attempt === maxAttempts) {
          console.error(`[AI ROUTER] Gemini model ${modelName} exhausted, moving to next model.`);
        }
      }
    }
  }

  throw new Error("Gemini attempts exhausted.");
}

// 2. GROQ (Llama)
async function groqProvider(count: number, hex: string, difficulty: string) {
  const modelNames = getModelList(
    "GROQ_MODEL",
    "openai/gpt-oss-20b,meta-llama/llama-4-scout-17b-16e-instruct"
  );
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQ_API_KEY");

  const groq = new Groq({ apiKey });
  const maxAttempts = 2;

  for (const modelName of modelNames) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      logProviderAttempt("groq", modelName, attempt, maxAttempts);
      try {
        const response = await groq.chat.completions.create({
          messages: [{ role: "system", content: SYSTEM_PROMPT(count, hex, difficulty) }],
          model: modelName,
          response_format: { type: "json_object" },
        });

        const parsed = parseQuizPayload(extractText(response.choices[0]?.message?.content) || "[]");
        const validated = validateQuizQuality(parsed, count);
        logProviderSuccess("groq", modelName, validated.length);
        return validated;
      } catch (err: any) {
        const msg = err?.message || String(err);
        console.warn(`[AI ROUTER] Groq model ${modelName} attempt ${attempt} failed: ${msg}`);
        if (attempt === maxAttempts) {
          console.error(`[AI ROUTER] Groq model ${modelName} exhausted, moving to next model.`);
        }
      }
    }
  }

  throw new Error("Groq attempts exhausted.");
}

// 3. OPENROUTER
async function openrouterProvider(count: number, hex: string, difficulty: string) {
  const modelNames = getModelList(
    "OPENROUTER_MODEL",
    "stepfun/step-3.5-flash:free,nvidia/nemotron-3-nano-30b-a3b:free,arcee-ai/trinity-mini:free,z-ai/glm-4.5-air:free"
  );
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");

  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });
  const maxAttempts = 2;

  for (const modelName of modelNames) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      logProviderAttempt("openrouter", modelName, attempt, maxAttempts);
      try {
        const response = await openai.chat.completions.create({
          model: modelName,
          messages: [{ role: "system", content: SYSTEM_PROMPT(count, hex, difficulty) }],
          response_format: { type: "json_object" } as any,
        });

        const parsed = parseQuizPayload(extractText(response.choices[0]?.message?.content) || "[]");
        const validated = validateQuizQuality(parsed, count);
        logProviderSuccess("openrouter", modelName, validated.length);
        return validated;
      } catch (err: any) {
        const msg = err?.message || String(err);
        console.warn(`[AI ROUTER] OpenRouter model ${modelName} attempt ${attempt} failed: ${msg}`);
        if (attempt === maxAttempts) {
          console.error(`[AI ROUTER] OpenRouter model ${modelName} exhausted, moving to next model.`);
        }
      }
    }
  }

  throw new Error("OpenRouter attempts exhausted.");
}

// 4. CLOUDFLARE AI GATEWAY
async function cloudflareProvider(count: number, hex: string, difficulty: string) {
  const modelNames = getModelList(
    "CLOUDFLARE_MODEL",
    "@cf/meta/llama-4-scout-17b-16e-instruct,@cf/zai-org/glm-4.7-flash"
  );
  const apiKey = process.env.CLOUDFLARE_API_KEY;
  if (!apiKey) throw new Error("Missing CLOUDFLARE_API_KEY");

  const cfClient = new OpenAI({
    apiKey,
    baseURL: `https://gateway.ai.cloudflare.com/v1/${process.env.CLOUDFLARE_ACCOUNT_ID}/${process.env.CLOUDFLARE_GATEWAY_ID}/workers-ai/`,
  });
  const maxAttempts = 2;

  for (const modelName of modelNames) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      logProviderAttempt("cloudflare", modelName, attempt, maxAttempts);
      try {
        const response = await cfClient.chat.completions.create({
          model: modelName,
          messages: [{ role: "system", content: SYSTEM_PROMPT(count, hex, difficulty) }],
          response_format: { type: "json_object" } as any,
        });

        const parsed = parseQuizPayload(extractText(response.choices[0]?.message?.content) || "[]");
        const validated = validateQuizQuality(parsed, count);
        logProviderSuccess("cloudflare", modelName, validated.length);
        return validated;
      } catch (err: any) {
        const msg = err?.message || String(err);
        console.warn(`[AI ROUTER] Cloudflare model ${modelName} attempt ${attempt} failed: ${msg}`);
        if (attempt === maxAttempts) {
          console.error(`[AI ROUTER] Cloudflare model ${modelName} exhausted, moving to next model.`);
        }
      }
    }
  }

  throw new Error("Cloudflare attempts exhausted.");
}

import { OpenAI } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { QuizGenerationSchema } from "./schema";

// Provider Selection logic: Random + Fallback
export async function generateQuiz(count: number, hexSeed: string, difficulty: string) {
  const providers = ["gemini", "groq", "openrouter", "cloudflare"];
  const randomOrder = providers.sort(() => Math.random() - 0.5);

  for (const provider of randomOrder) {
    try {
      console.log(`[AI ROUTER] Attempting with: ${provider}`);
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
    } catch (err) {
      console.error(`[AI ROUTER] provider ${provider} failed:`, err);
      continue;
    }
  }
  throw new Error("All AI providers failed. Check API keys and network.");
}

const SYSTEM_PROMPT = (count: number, hex: string, difficulty: string) => `
You are a competitive IPL cricket analyst. 
Generate exactly ${count} multiple choice questions about IPL.
Difficulty Obscurity Level: ${hex} (${difficulty}).
Output MUST be a valid JSON array of objects.

Schema:
{
  "type": "trivia" | "stat_puzzle",
  "question": string,
  "options": [string, string, string, string],
  "answer": string (Exact text from one of the options)
}
`;

// 1. GEMINI 2.5 FLASH (Google)
async function geminiProvider(count: number, hex: string, difficulty: string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash-latest" });
  const result = await model.generateContent(SYSTEM_PROMPT(count, hex, difficulty));
  const text = result.response.text();
  const cleanJson = text.replace(/```json|```/g, "").trim();
  return QuizGenerationSchema.parse(JSON.parse(cleanJson));
}

// 2. GROQ (Llama)
async function groqProvider(count: number, hex: string, difficulty: string) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const response = await groq.chat.completions.create({
    messages: [{ role: "system", content: SYSTEM_PROMPT(count, hex, difficulty) }],
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  });
  const data = JSON.parse(response.choices[0].message.content || "[]");
  // Some models return wrapped in a key
  const questions = Array.isArray(data) ? data : (data.questions || []);
  return QuizGenerationSchema.parse(questions);
}

// 3. OPENROUTER
async function openrouterProvider(count: number, hex: string, difficulty: string) {
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  });
  const response = await openai.chat.completions.create({
    model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct",
    messages: [{ role: "system", content: SYSTEM_PROMPT(count, hex, difficulty) }],
  });
  const data = JSON.parse(response.choices[0].message.content || "[]");
  return QuizGenerationSchema.parse(data);
}

// 4. CLOUDFLARE AI GATEWAY
async function cloudflareProvider(count: number, hex: string, difficulty: string) {
  const cfClient = new OpenAI({
    apiKey: process.env.CLOUDFLARE_API_KEY,
    baseURL: `https://gateway.ai.cloudflare.com/v1/${process.env.CLOUDFLARE_ACCOUNT_ID}/${process.env.CLOUDFLARE_GATEWAY_ID}/workers-ai/`,
  });
  const response = await cfClient.chat.completions.create({
    model: process.env.CLOUDFLARE_MODEL || "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    messages: [{ role: "system", content: SYSTEM_PROMPT(count, hex, difficulty) }],
  });
  const data = JSON.parse(response.choices[0].message.content || "[]");
  return QuizGenerationSchema.parse(data);
}

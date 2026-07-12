import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL =
  process.env.GEMINI_MODEL ?? "gemini-3.5-flash";

export const GEMINI_FALLBACK_MODEL =
  process.env.GEMINI_FALLBACK_MODEL ??
  "gemini-3.1-flash-lite";

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY no está configurada en el archivo .env.local.",
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}


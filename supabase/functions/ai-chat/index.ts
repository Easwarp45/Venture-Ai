import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  message: string;
  persona: string;
  history: { role: string; content: string }[];
  systemPrompt: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message, persona, history, systemPrompt }: ChatRequest = await req.json();

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    // If no AI keys configured, signal the client to use the built-in engine
    if (!geminiKey && !openaiKey) {
      return new Response(
        JSON.stringify({
          useBuiltinEngine: true,
          message: "No AI API keys configured. Using built-in expert engine.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build conversation for the AI provider
    const conversationHistory = (history || []).slice(-10).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Try Gemini first
    if (geminiKey) {
      try {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                ...conversationHistory,
                { role: "user", parts: [{ text: message }] },
              ],
              systemInstruction: { parts: [{ text: systemPrompt }] },
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
              },
            }),
          }
        );

        if (geminiResponse.ok) {
          const data = await geminiResponse.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return new Response(
              JSON.stringify({ content: text, persona, useBuiltinEngine: false }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch (_e) {
        // Fall through to OpenAI
      }
    }

    // Try OpenAI
    if (openaiKey) {
      try {
        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              ...(history || []).slice(-10).map((m) => ({
                role: m.role === "assistant" ? "assistant" : "user",
                content: m.content,
              })),
              { role: "user", content: message },
            ],
            temperature: 0.7,
            max_tokens: 2048,
          }),
        });

        if (openaiResponse.ok) {
          const data = await openaiResponse.json();
          const text = data?.choices?.[0]?.message?.content;
          if (text) {
            return new Response(
              JSON.stringify({ content: text, persona, useBuiltinEngine: false }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch (_e) {
        // Fall through to built-in
      }
    }

    // All providers failed — signal fallback
    return new Response(
      JSON.stringify({
        useBuiltinEngine: true,
        message: "AI providers unavailable. Using built-in expert engine.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { NextResponse } from 'next/server';
import { PERSONAS } from '@/lib/ai/personas';
import { detectIntent } from '@/lib/ai/intent-router';
import { runAIEngine } from '@/lib/ai/engine';

export async function POST(request: Request) {
  try {
    const { message, persona, history } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API_KEY_MISSING' }, { status: 400 });
    }

    const personaDef = PERSONAS[persona as keyof typeof PERSONAS] || PERSONAS.general;

    // Build alternating message history for Gemini API
    const contents: any[] = [];
    let lastRole: string | null = null;
    
    if (Array.isArray(history)) {
      for (const m of history) {
        if (!m.content || !m.role) continue;
        const role = m.role === 'user' ? 'user' : 'model';
        
        if (role === lastRole) {
          // If the role is consecutive, append text to the previous message's parts to avoid Gemini API role alternation errors
          if (contents.length > 0) {
            contents[contents.length - 1].parts[0].text += '\n\n' + m.content;
          }
        } else {
          contents.push({
            role,
            parts: [{ text: m.content }]
          });
          lastRole = role;
        }
      }
    }

    // Append current user message if it's not already at the end of history
    if (lastRole !== 'user') {
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });
    }

    // Call the Gemini REST endpoint
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: personaDef.systemPrompt }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API call failed:', errText);
      return NextResponse.json({ error: 'GEMINI_API_ERROR', details: errText }, { status: response.status });
    }

    const resData = await response.json();
    const replyText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Run local rule engine to extract intent and merge metadata (like charts, document states, tasks)
    const localEngineResult = runAIEngine({ message, persona, history });

    return NextResponse.json({
      content: replyText,
      metadata: {
        ...localEngineResult.metadata,
      },
      persona,
    });
  } catch (error: any) {
    console.error('Error in chat API route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

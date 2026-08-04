import { detectIntent } from '@/lib/ai/intent-router';
import { generateResponse } from '@/lib/ai/generators';
import { PERSONAS } from '@/lib/ai/personas';
import { TOOLS } from '@/lib/ai/tools';
import type { AIPersona, MessageMetadata } from '@/lib/database.types';

export interface AIEngineInput {
  message: string;
  persona: AIPersona;
  history: { role: string; content: string }[];
  toolId?: string;
  toolInputs?: Record<string, string>;
}

export interface AIEngineOutput {
  content: string;
  metadata?: MessageMetadata;
  persona: AIPersona;
}

export function runAIEngine(input: AIEngineInput): AIEngineOutput {
  const personaDef = PERSONAS[input.persona] || PERSONAS.general;

  if (input.toolId && TOOLS[input.toolId] && input.toolInputs) {
    const tool = TOOLS[input.toolId];
    const result = tool.run(input.toolInputs);
    return {
      content: result.content,
      metadata: result.metadata,
      persona: input.persona,
    };
  }

  const intent = detectIntent(input.message);
  const response = generateResponse(intent.type, {
    idea: input.message,
    personaName: personaDef.name,
    history: input.history,
  });

  return {
    content: response.content,
    metadata: response.metadata,
    persona: input.persona,
  };
}

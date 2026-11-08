import { NextResponse } from 'next/server';
import { chatWithAssistant } from '@/lib/gemini/assistant';
import { readJsonObject } from '@/lib/http';

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    if (!body || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const result = await chatWithAssistant(body.messages);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/ai/assistant:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Assistant processing failed' },
      { status: 500 }
    );
  }
}

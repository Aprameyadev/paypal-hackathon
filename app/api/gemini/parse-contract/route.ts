import { NextResponse } from 'next/server';
import { parseContractIntent } from '@/lib/gemini/client';
import { readJsonObject } from '@/lib/http';

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: 'Request body must be a valid JSON object' }, { status: 400 });
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'A natural language agreement prompt is required' }, { status: 400 });
    }
    if (prompt.length > 10_000) {
      return NextResponse.json({ error: 'Agreement prompts must be 10,000 characters or fewer' }, { status: 413 });
    }

    const parsedContract = await parseContractIntent(prompt);

    return NextResponse.json({
      success: true,
      data: parsedContract,
    });
  } catch (error) {
    console.error('Error in /api/gemini/parse-contract:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gemini AI failed to parse contract terms' },
      { status: 500 }
    );
  }
}

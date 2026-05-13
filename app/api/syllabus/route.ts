import { NextRequest, NextResponse } from 'next/server';
import { callClaude, parseActivityJson, SYLLABUS_MODEL, DEFAULT_MODEL } from '@/lib/anthropic';
import { SYSTEM_PROMPT } from '@/lib/prompts/system';
import { buildSyllabusExtractPrompt, buildSyllabusActivityPrompt } from '@/lib/prompts/syllabus';
import { createActivity } from '@/lib/activity-bank';
import { checkRateLimit } from '@/lib/rate-limit';
import { logAiUsage } from '@/lib/usage';
import { Activity } from '@/types/activity';

export const maxDuration = 60; // Vercel: allow up to 60s for multi-activity generation

async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.txt') || name.endsWith('.md')) {
    return file.text();
  }

  if (name.endsWith('.pdf')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await pdfParse(buffer);
    return result.text;
  }

  if (name.endsWith('.docx')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require('mammoth') as {
      extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string }>;
    };
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error('Unsupported file type. Upload PDF, DOCX, TXT, or MD.');
}

export async function POST(req: NextRequest) {
  const sessionId = req.headers.get('x-session-id') ?? 'anonymous';
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '0.0.0.0';

  // Stage 1: extract objectives from uploaded file
  const action = req.nextUrl.searchParams.get('action') ?? 'extract';

  if (action === 'extract') {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > 500_000) {
      return NextResponse.json({ error: 'File too large (max 500KB)' }, { status: 400 });
    }

    let text: string;
    try {
      text = await extractText(file);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Could not read file' },
        { status: 422 }
      );
    }

    const limit = await checkRateLimit(sessionId, ip);
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Daily AI limit reached.' }, { status: 429 });
    }

    const { text: raw, usage } = await callClaude({
      model: SYLLABUS_MODEL,
      system: SYSTEM_PROMPT,
      userMessage: buildSyllabusExtractPrompt(text),
      maxTokens: 400,
    });

    await logAiUsage({
      session_id: sessionId,
      ip_hash: ip,
      feature: 'syllabus',
      model: SYLLABUS_MODEL,
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
    });

    const objectives = parseActivityJson<string[]>(raw);
    return NextResponse.json({ objectives });
  }

  // Stage 2: generate activities from selected objectives
  if (action === 'generate') {
    const body = await req.json();
    const objectives: string[] = body.objectives ?? [];
    const context: string | undefined = body.context;

    if (!objectives.length) {
      return NextResponse.json({ error: 'No objectives provided' }, { status: 400 });
    }

    const limit = await checkRateLimit(sessionId, ip);
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Daily AI limit reached.' }, { status: 429 });
    }

    const results: Activity[] = [];

    for (const objective of objectives.slice(0, 6)) {
      const { text: raw, usage } = await callClaude({
        model: DEFAULT_MODEL,
        system: SYSTEM_PROMPT,
        userMessage: buildSyllabusActivityPrompt(objective, context),
        maxTokens: 900,
      });

      const parsed = parseActivityJson<Activity>(raw);
      const activity = { ...parsed, source: 'syllabus_derived' as const, topics: parsed.topics ?? [] };

      const saved = await createActivity(activity);

      await logAiUsage({
        session_id: sessionId,
        ip_hash: ip,
        feature: 'syllabus',
        model: DEFAULT_MODEL,
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        output_activity_id: saved.id,
      });

      results.push(saved);
    }

    return NextResponse.json({ activities: results });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

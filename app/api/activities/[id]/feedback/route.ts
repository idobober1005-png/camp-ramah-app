import { NextRequest, NextResponse } from 'next/server';
import { recordFeedback } from '@/lib/activity-bank';
import { FeedbackPayload } from '@/types/activity';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body: FeedbackPayload = await req.json();

    const validResponses = ['worked_well', 'too_chaotic', 'too_boring', 'run_again'];
    if (!validResponses.includes(body.response)) {
      return NextResponse.json({ error: 'Invalid response type' }, { status: 400 });
    }

    await recordFeedback(id, body.response, body.age_group, body.location);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/activities/[id]/feedback]', err);
    return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 });
  }
}

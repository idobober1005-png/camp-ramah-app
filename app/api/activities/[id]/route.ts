import { NextRequest, NextResponse } from 'next/server';
import { getActivityById } from '@/lib/activity-bank';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const activity = await getActivityById(id);
    if (!activity) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ activity });
  } catch (err) {
    console.error('[GET /api/activities/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const creatorId = req.headers.get('x-creator-id') ?? '';

  try {
    const db = createServerClient();

    // Ownership check
    const { data: existing, error: fetchErr } = await db
      .from('activities')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (!existing.creator_id || existing.creator_id !== creatorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    // Prevent overwriting ownership / audit fields from client
    const { creator_id: _c, id: _id, created_at: _ca, ...safeBody } = body;

    const { data, error } = await db
      .from('activities')
      .update(safeBody)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ activity: data });
  } catch (err) {
    console.error('[PATCH /api/activities/[id]]', err);
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const creatorId = req.headers.get('x-creator-id') ?? '';

  try {
    const db = createServerClient();

    // Ownership check
    const { data: existing, error: fetchErr } = await db
      .from('activities')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (!existing.creator_id || existing.creator_id !== creatorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await db.from('activities').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/activities/[id]]', err);
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 });
  }
}

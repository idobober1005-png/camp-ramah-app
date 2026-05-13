import { NextRequest, NextResponse } from 'next/server';
import { searchActivities, createActivity } from '@/lib/activity-bank';
import { ActivityFilter } from '@/types/activity';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const filter: ActivityFilter = {
    search: searchParams.get('search') ?? undefined,
    energy_level: (searchParams.get('energy_level') as ActivityFilter['energy_level']) ?? undefined,
    location: (searchParams.get('location') as ActivityFilter['location']) ?? undefined,
    duration_max: searchParams.get('duration_max')
      ? parseInt(searchParams.get('duration_max')!)
      : undefined,
    age: searchParams.get('age') ? parseInt(searchParams.get('age')!) : undefined,
    tags: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined,
    topics: searchParams.get('topics') ? searchParams.get('topics')!.split(',') : undefined,
  };

  try {
    const activities = await searchActivities(filter);
    return NextResponse.json({ activities });
  } catch (err) {
    console.error('[GET /api/activities]', err);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const activity = await createActivity(body);
    return NextResponse.json({ activity }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/activities]', err);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}

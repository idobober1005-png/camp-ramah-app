import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getActivityById } from '@/lib/activity-bank';
import { ActivityDetail } from '@/components/activity/ActivityDetail';

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activity = await getActivityById(id);

  if (!activity) notFound();

  return (
    <>
      {/* Back nav */}
      <div className="px-4 pt-4 max-w-lg mx-auto">
        <Link
          href="/bank"
          className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700"
        >
          → חזור לבנק
        </Link>
      </div>
      <ActivityDetail activity={activity} />
    </>
  );
}

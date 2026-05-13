import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getActivityById } from '@/lib/activity-bank';
import { ActivityEditForm } from '@/components/forms/ActivityEditForm';

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activity = await getActivityById(id);
  if (!activity) notFound();

  return (
    <>
      <div className="px-4 pt-4 max-w-lg mx-auto">
        <Link
          href={`/bank/${id}`}
          className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700"
        >
          → חזור לפעילות
        </Link>
      </div>
      <ActivityEditForm activity={activity} />
    </>
  );
}

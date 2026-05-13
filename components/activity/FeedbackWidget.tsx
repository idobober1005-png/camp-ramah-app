'use client';

import { useState } from 'react';
import { FeedbackType } from '@/types/activity';

const FEEDBACK_OPTIONS: { value: FeedbackType; label: string; emoji: string }[] = [
  { value: 'worked_well', label: 'עבד מעולה!', emoji: '✅' },
  { value: 'too_chaotic', label: 'יצא כאוטי', emoji: '😅' },
  { value: 'too_boring', label: 'היה משעמם', emoji: '😴' },
  { value: 'run_again', label: 'לרוץ שוב', emoji: '🔁' },
];

interface FeedbackWidgetProps {
  activityId: string;
  counts?: {
    worked_well: number;
    too_chaotic: number;
    too_boring: number;
    run_again: number;
  };
}

export function FeedbackWidget({ activityId, counts }: FeedbackWidgetProps) {
  const [submitted, setSubmitted] = useState<FeedbackType | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFeedback(response: FeedbackType) {
    if (submitted || loading) return;
    setLoading(true);
    try {
      await fetch(`/api/activities/${activityId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      });
      setSubmitted(response);
    } catch {
      // silently fail — feedback is non-critical
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 pt-5 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        איך יצא?
      </p>
      <div className="grid grid-cols-2 gap-2">
        {FEEDBACK_OPTIONS.map((opt) => {
          const isSelected = submitted === opt.value;
          const count = counts?.[opt.value] ?? 0;
          return (
            <button
              key={opt.value}
              onClick={() => handleFeedback(opt.value)}
              disabled={!!submitted || loading}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors
                ${isSelected
                  ? 'border-green-500 bg-green-50 text-green-800'
                  : submitted
                  ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 active:scale-95'
                }`}
            >
              <span>{opt.emoji}</span>
              <span className="flex-1 text-left">{opt.label}</span>
              {count > 0 && (
                <span className="text-xs text-gray-400">{isSelected ? count + 1 : count}</span>
              )}
            </button>
          );
        })}
      </div>
      {submitted && (
        <p className="text-xs text-green-700 mt-2 text-center">
          תודה על המשוב! 🙏
        </p>
      )}
    </div>
  );
}

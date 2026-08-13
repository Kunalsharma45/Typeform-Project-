'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Sparkles, X } from 'lucide-react';

interface AISuggestionCardProps {
  id: string;
  text: string;
}

export default function AISuggestionCard({ text }: AISuggestionCardProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleUseForm = () => {
    toast('Coming soon', { icon: '🚧' });
  };

  return (
    <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4 flex flex-col justify-between relative transition-all shadow-xs hover:border-purple-200">
      {/* Top row: Sparkle Icon + Dismiss Button */}
      <div className="flex items-start justify-between gap-3">
        <div className="w-8 h-8 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 fill-purple-600/20" />
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-purple-100/50 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested prompt text */}
      <p className="text-xs text-gray-700 font-medium my-3 leading-relaxed">
        {text}
      </p>

      {/* Action button */}
      <div>
        <button
          onClick={handleUseForm}
          className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors shadow-xs"
        >
          Use this form
        </button>
      </div>
    </div>
  );
}

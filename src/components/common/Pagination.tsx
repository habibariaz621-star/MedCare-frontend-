'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between border-t border-violet-200/70 dark:border-violet-800/50 pt-4">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="flex items-center space-x-1 border border-violet-200 dark:border-violet-700 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-violet-50 dark:hover:bg-violet-950/50 disabled:opacity-50 transition-colors text-violet-800 dark:text-violet-200"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Previous</span>
      </button>
      <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
        Page {page} of {Math.max(totalPages, 1)}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="flex items-center space-x-1 border border-violet-200 dark:border-violet-700 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-violet-50 dark:hover:bg-violet-950/50 disabled:opacity-50 transition-colors text-violet-800 dark:text-violet-200"
      >
        <span>Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, totalElements, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-b-2xl">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-600">
            Page <span className="font-semibold text-slate-900">{currentPage + 1}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalPages}</span>
            {totalElements !== undefined && (
              <> ({totalElements} total results)</>
            )}
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className={`relative inline-flex items-center rounded-l-xl px-2.5 py-1.5 text-sm font-medium border border-slate-300 ${
                currentPage === 0
                  ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            {/* Display up to 5 page buttons */}
            {[...Array(totalPages)].map((_, i) => {
              if (
                i === 0 ||
                i === totalPages - 1 ||
                (i >= currentPage - 1 && i <= currentPage + 1)
              ) {
                return (
                  <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`relative inline-flex items-center px-3.5 py-1.5 text-sm font-semibold border ${
                      currentPage === i
                        ? 'z-10 bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              }
              if (i === currentPage - 2 || i === currentPage + 2) {
                return (
                  <span
                    key={i}
                    className="relative inline-flex items-center px-2 py-1.5 text-sm font-semibold text-slate-400 border border-slate-300 bg-white"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className={`relative inline-flex items-center rounded-r-xl px-2.5 py-1.5 text-sm font-medium border border-slate-300 ${
                currentPage >= totalPages - 1
                  ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile simple buttons */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="relative inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-sm text-slate-600 py-1.5">
          {currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="relative inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;

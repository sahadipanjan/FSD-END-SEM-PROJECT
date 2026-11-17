import React from 'react';

const StatusBadge = ({ type, status, claimStatus, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  if (type) {
    if (type === 'LOST') {
      return (
        <span className={`inline-flex items-center font-semibold rounded-full bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 ${sizeClasses}`}>
          LOST
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center font-semibold rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 ${sizeClasses}`}>
        FOUND
      </span>
    );
  }

  if (status) {
    switch (status) {
      case 'OPEN':
        return (
          <span className={`inline-flex items-center font-medium rounded-full bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            OPEN
          </span>
        );
      case 'RESOLVED':
        return (
          <span className={`inline-flex items-center font-medium rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 ${sizeClasses}`}>
            RESOLVED
          </span>
        );
      case 'REMOVED':
        return (
          <span className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20 ${sizeClasses}`}>
            REMOVED
          </span>
        );
      default:
        return null;
    }
  }

  if (claimStatus) {
    switch (claimStatus) {
      case 'PENDING':
        return (
          <span className={`inline-flex items-center font-medium rounded-full bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 ${sizeClasses}`}>
            PENDING
          </span>
        );
      case 'APPROVED':
        return (
          <span className={`inline-flex items-center font-medium rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 ${sizeClasses}`}>
            APPROVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className={`inline-flex items-center font-medium rounded-full bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 ${sizeClasses}`}>
            REJECTED
          </span>
        );
      default:
        return null;
    }
  }

  return null;
};

export default StatusBadge;

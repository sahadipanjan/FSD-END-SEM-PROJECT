import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { History, Shield, Clock, Database, Tag } from 'lucide-react';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/audit-logs?page=${page}&size=15`);
      setLogs(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error('Failed to load audit trail', err);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const getActionColor = (action) => {
    if (action.includes('APPROVED') || action.includes('RESTORED') || action.includes('UNBLOCKED')) {
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
    }
    if (action.includes('REJECTED') || action.includes('BLOCKED') || action.includes('REMOVED')) {
      return 'bg-rose-50 text-rose-700 ring-rose-600/20';
    }
    return 'bg-indigo-50 text-indigo-700 ring-indigo-600/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Administrative Audit Trail</h1>
        <p className="text-sm text-slate-500 mt-1">
          Immutable system journal tracking all administrative interventions, claim adjudications, and moderation events.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Reading audit journal..." />
      ) : logs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-sm text-slate-400">
          No audit entries recorded yet.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Administrator</th>
                  <th className="py-4 px-6">Action</th>
                  <th className="py-4 px-6">Target</th>
                  <th className="py-4 px-6">Context & Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition text-xs">
                    <td className="py-4 px-6 whitespace-nowrap text-slate-500">
                      <div className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-800 whitespace-nowrap">
                      <div className="flex items-center">
                        <Shield className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                        {log.adminEmail}
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ring-1 ring-inset ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap font-mono text-slate-500">
                      {log.targetType} #{log.targetId || '—'}
                    </td>

                    <td className="py-4 px-6 text-slate-700 max-w-md">
                      <p className="line-clamp-2">{log.details || '—'}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;

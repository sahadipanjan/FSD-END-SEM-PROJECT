import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { FileCheck, ExternalLink, Calendar, MessageSquare, ShieldAlert } from 'lucide-react';

const MyClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchMyClaims = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/user/claims/mine?page=${page}&size=10`);
      setClaims(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error('Failed to load my claims', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyClaims();
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">My Ownership Claims</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review the status of claims you submitted for items found on campus and read administrative remarks.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading your claims..." />
      ) : claims.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No claims submitted"
          description="You haven't filed any ownership claims yet. If you spot an item in the directory that belongs to you, click 'Claim This Item' to file a claim."
          actionLabel="Browse Item Directory"
          onAction={() => window.location.href = '/user/browse'}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <StatusBadge type={claim.itemType} />
                    <StatusBadge claimStatus={claim.status} />
                  </div>
                  <span className="text-xs text-slate-400 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    Submitted: {new Date(claim.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <Link
                      to={`/user/items/${claim.itemId}`}
                      className="text-base font-bold text-slate-900 hover:text-indigo-600 transition inline-flex items-center"
                    >
                      {claim.itemTitle}
                      <ExternalLink className="w-4 h-4 ml-1.5 text-slate-400" />
                    </Link>

                    <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-700 block mb-1">Your Submitted Proof:</span>
                      <p className="italic leading-relaxed whitespace-pre-wrap">"{claim.message}"</p>
                    </div>

                    {/* Official Desk Remark Callout */}
                    {claim.adminRemark ? (
                      <div className={`mt-3 p-3.5 rounded-xl border text-xs leading-relaxed ${
                        claim.status === 'APPROVED'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : claim.status === 'REJECTED'
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}>
                        <div className="flex items-center font-semibold mb-0.5">
                          <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
                          <span>Campus Desk Official Remark:</span>
                        </div>
                        <p>{claim.adminRemark}</p>
                      </div>
                    ) : (
                      <div className="mt-3 text-[11px] text-slate-400">
                        Pending review by campus desk administration. You will receive an in-app alert when reviewed.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
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

export default MyClaimsPage;

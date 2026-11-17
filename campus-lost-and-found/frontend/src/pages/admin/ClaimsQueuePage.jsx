import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Inbox,
  CheckCircle,
  XCircle,
  Clock,
  User,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  X,
  AlertTriangle,
} from 'lucide-react';

const ClaimsQueuePage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Approve Modal state
  const [approveClaim, setApproveClaim] = useState(null);
  const [approveRemark, setApproveRemark] = useState('');
  const [approveLoading, setApproveLoading] = useState(false);

  // Reject Modal state
  const [rejectClaim, setRejectClaim] = useState(null);
  const [rejectRemark, setRejectRemark] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page);
      params.append('size', 10);

      const res = await api.get(`/api/admin/claims?${params.toString()}`);
      setClaims(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error('Failed to load claims queue', err);
      toast.error('Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [page, statusFilter]);

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!approveClaim) return;

    setApproveLoading(true);
    try {
      await api.patch(`/api/admin/claims/${approveClaim.id}/approve`, {
        remark: approveRemark.trim() || 'Verified proof at campus desk. Item claimed and released.',
      });
      toast.success('Claim approved! Item resolved and competing claims closed.');
      setApproveClaim(null);
      setApproveRemark('');
      fetchClaims();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve claim');
    } finally {
      setApproveLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectClaim || !rejectRemark.trim()) {
      toast.error('Please provide a remark explaining the rejection reason');
      return;
    }

    setRejectLoading(true);
    try {
      await api.patch(`/api/admin/claims/${rejectClaim.id}/reject`, {
        remark: rejectRemark.trim(),
      });
      toast.success('Claim rejected and claimant notified');
      setRejectClaim(null);
      setRejectRemark('');
      fetchClaims();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject claim');
    } finally {
      setRejectLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Status Filter */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Desk Claims Mediation Queue</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review member proofs, verify matching details, and approve official handovers.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex p-1 bg-slate-100 rounded-2xl">
          {[
            { label: 'All', value: '' },
            { label: 'Pending', value: 'PENDING' },
            { label: 'Approved', value: 'APPROVED' },
            { label: 'Rejected', value: 'REJECTED' },
          ].map((pill) => (
            <button
              key={pill.value}
              onClick={() => {
                setStatusFilter(pill.value);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === pill.value
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Claims List */}
      {loading ? (
        <LoadingSpinner text="Retrieving claims queue..." />
      ) : claims.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No claims in queue"
          description={
            statusFilter
              ? `There are no ${statusFilter.toLowerCase()} claims at this time.`
              : 'The claims mediation queue is currently empty.'
          }
        />
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-semibold text-slate-400">#{claim.id}</span>
                  <StatusBadge type={claim.itemType} />
                  <StatusBadge claimStatus={claim.status} />
                  <span className="text-xs text-slate-500">• Item #{claim.itemId} ({claim.itemStatus})</span>
                </div>
                <div className="text-xs text-slate-400 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {new Date(claim.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 cols: Item & Claimant Message */}
                <div className="lg:col-span-2 space-y-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Item: {claim.itemTitle}
                  </h3>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
                    <p className="font-semibold text-slate-700 mb-1 flex items-center">
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                      Claimant's Ownership Proof / Description:
                    </p>
                    <p className="italic text-slate-600 leading-relaxed whitespace-pre-wrap">
                      "{claim.message}"
                    </p>
                  </div>

                  {claim.adminRemark && (
                    <div className="text-xs bg-slate-100/70 p-3 rounded-2xl text-slate-700">
                      <span className="font-semibold text-slate-900">Desk Remark:</span> {claim.adminRemark}
                    </div>
                  )}
                </div>

                {/* Right col: Claimant Profile & Mediation Action */}
                <div className="flex flex-col justify-between p-4 bg-slate-50/60 rounded-2xl border border-slate-100 text-xs space-y-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Claimant Identity
                    </span>
                    <p className="font-bold text-slate-900">{claim.claimantName}</p>
                    <p className="text-slate-500">{claim.claimantEmail}</p>
                    <p className="text-slate-500">{claim.claimantDepartment}</p>
                    {claim.claimantPhone && (
                      <p className="text-slate-500">Phone: {claim.claimantPhone}</p>
                    )}
                  </div>

                  {claim.status === 'PENDING' ? (
                    <div className="pt-3 border-t border-slate-200/60 flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setApproveClaim(claim);
                          setApproveRemark('Verified identity and proof details at desk. Handed over.');
                        }}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition flex items-center justify-center space-x-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => {
                          setRejectClaim(claim);
                          setRejectRemark('');
                        }}
                        className="flex-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-semibold transition flex items-center justify-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 text-center text-slate-400 italic">
                      Review completed
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Approve Modal */}
      {approveClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setApproveClaim(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Approve Ownership Claim</h3>
                <p className="text-xs text-slate-500">
                  Item: <span className="font-semibold text-slate-800">{approveClaim.itemTitle}</span>
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs mb-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  Approving will mark the item as <span className="font-bold">RESOLVED</span>, automatically reject all other pending claims on this item, and send collection instructions to the claimant.
                </p>
              </div>
            </div>

            <form onSubmit={handleApproveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Administrative Remark / Pickup Instructions
                </label>
                <textarea
                  rows={3}
                  value={approveRemark}
                  onChange={(e) => setApproveRemark(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setApproveClaim(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={approveLoading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {approveLoading ? 'Approving...' : 'Confirm Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setRejectClaim(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reject Ownership Claim</h3>
                <p className="text-xs text-slate-500">
                  Item: <span className="font-semibold text-slate-800">{rejectClaim.itemTitle}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Serial number mismatch, failed identification of concealed marks, or insufficient verification..."
                  value={rejectRemark}
                  onChange={(e) => setRejectRemark(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRejectClaim(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectLoading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {rejectLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimsQueuePage;

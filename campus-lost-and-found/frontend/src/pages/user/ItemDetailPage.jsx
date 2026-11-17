import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { API_BASE_URL } from '../../api/client';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  MapPin,
  Tag,
  Calendar,
  User,
  Mail,
  Building,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Trash2,
  Edit,
  Handshake,
  ImageOff,
  Phone,
  AlertCircle,
  X,
} from 'lucide-react';

const ItemDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Claim modal state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchItemData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/user/items/${id}`);
      setItem(res.data);

      // If item is LOST, fetch smart suggestions
      if (res.data.type === 'LOST') {
        try {
          const suggRes = await api.get(`/api/user/items/${id}/suggestions`);
          setSuggestions(suggRes.data || []);
        } catch (suggErr) {
          console.error('Failed to load suggestions', suggErr);
        }
      }
    } catch (err) {
      toast.error('Could not find requested item');
      navigate('/user/browse');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemData();
  }, [id]);

  const isOwner = user && item && user.id === item.reportedByUserId;

  const handleResolveItem = async () => {
    try {
      await api.patch(`/api/user/items/${id}/resolve`);
      toast.success('Item marked as resolved!');
      fetchItemData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark item resolved');
    }
  };

  const handleDeleteItem = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/api/user/items/${id}`);
      toast.success('Item report deleted successfully');
      navigate('/user/my-items');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete item');
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
    }
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!claimMessage.trim() || claimMessage.trim().length < 10) {
      toast.error('Please describe proof details (minimum 10 characters)');
      return;
    }

    setClaimLoading(true);
    try {
      await api.post(`/api/user/items/${id}/claims`, {
        message: claimMessage.trim(),
      });
      toast.success('Claim submitted successfully! The campus desk will mediate.');
      setClaimModalOpen(false);
      setClaimMessage('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit claim');
    } finally {
      setClaimLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading item details..." />;
  }

  if (!item) return null;

  const imageUrl = item.imagePath ? `${API_BASE_URL}${item.imagePath}` : null;

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-2">
      {/* Item Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Photo Preview / Placeholder */}
          <div className="bg-slate-100 flex items-center justify-center min-h-[320px] max-h-[460px] relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-100">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-300 p-8">
                <ImageOff className="w-16 h-16 stroke-[1.5]" />
                <span className="text-xs text-slate-400 mt-2 font-medium">No photograph uploaded</span>
              </div>
            )}

            <div className="absolute top-4 left-4 flex space-x-2">
              <StatusBadge type={item.type} size="md" />
            </div>
            <div className="absolute top-4 right-4">
              <StatusBadge status={item.status} size="md" />
            </div>
          </div>

          {/* Details & Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 text-xs text-slate-500 mb-2">
                <span className="inline-flex items-center">
                  <Tag className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {item.categoryName}
                </span>
                <span>•</span>
                <span className="inline-flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {item.locationName}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {item.title}
              </h1>

              <div className="mt-4 prose prose-slate text-sm text-slate-600 leading-relaxed">
                <p className="whitespace-pre-wrap">{item.description}</p>
              </div>

              {/* Event Metadata */}
              <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Date {item.type === 'LOST' ? 'Lost' : 'Found'}</span>
                  <span className="text-slate-900 font-semibold flex items-center mt-0.5">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {item.eventDate}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Contact Channel</span>
                  <span className="text-slate-900 font-semibold flex items-center mt-0.5">
                    <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {item.contactPreference || 'Campus Desk'}
                  </span>
                </div>
              </div>

              {/* Reporter Information */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center space-x-3 text-xs">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="font-semibold text-slate-900 truncate">{item.reportedByName}</p>
                  <p className="text-slate-500 truncate">{item.reportedByDepartment} • {item.reportedByEmail}</p>
                </div>
              </div>

              {item.removalReason && (
                <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs">
                  <span className="font-semibold">Desk Removal Note:</span> {item.removalReason}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-3">
              {isOwner ? (
                <>
                  {item.status === 'OPEN' && (
                    <button
                      onClick={handleResolveItem}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition inline-flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      Mark Resolved
                    </button>
                  )}

                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition inline-flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete Report
                  </button>
                </>
              ) : (
                <>
                  {item.status === 'OPEN' ? (
                    <button
                      onClick={() => setClaimModalOpen(true)}
                      className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 transition inline-flex items-center justify-center"
                    >
                      <Handshake className="w-4 h-4 mr-2" />
                      {item.type === 'FOUND' ? 'Claim This Item' : 'I Found This Item'}
                    </button>
                  ) : (
                    <div className="w-full text-center py-2 px-4 rounded-xl bg-slate-100 text-slate-500 text-xs font-medium">
                      This item is marked as {item.status} and is no longer accepting claims.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Smart Suggestions Section (For LOST items) */}
      {item.type === 'LOST' && (
        <section className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 rounded-3xl p-6 sm:p-8 border border-indigo-100 shadow-sm">
          <div className="flex items-center space-x-2 text-indigo-700 font-bold text-lg mb-1">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2>Smart Matches Found on Campus</h2>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Our recommendation algorithm detected these active found items matching your category, location, and keywords.
          </p>

          {suggestions.length === 0 ? (
            <div className="text-center py-8 bg-white/70 rounded-2xl border border-indigo-50 text-xs text-slate-400">
              No potential found matches found yet. We will notify you if a matching report is submitted!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map((sugg) => (
                <div
                  key={sugg.item.id}
                  className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm hover:shadow transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        {sugg.matchScore}% Match Score
                      </span>
                      <span className="text-[10px] text-slate-400">{sugg.item.eventDate}</span>
                    </div>

                    <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">{sugg.item.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{sugg.item.description}</p>
                    <p className="text-[11px] text-indigo-600 mt-2 font-medium italic">
                      Matched by: {sugg.matchReason}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{sugg.item.locationName}</span>
                    <Link
                      to={`/user/items/${sugg.item.id}`}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                    >
                      Inspect Match
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Claim Submission Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setClaimModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Handshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Submit Claim Verification
                </h3>
                <p className="text-xs text-slate-500">
                  Item: <span className="font-semibold text-slate-800">{item.title}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proof of Ownership & Distinct Details *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide hidden stickers, serial numbers, concealed scratches, or specific contents to verify your ownership with campus desk staff..."
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  The desk officer will inspect this description before releasing the item.
                </span>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setClaimModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={claimLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {claimLoading ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Item Report"
        message="Are you sure you want to delete this reported item? Any associated claims will also be removed. This action cannot be undone."
        confirmText="Delete Report"
        isDestructive={true}
        isLoading={deleteLoading}
        onConfirm={handleDeleteItem}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default ItemDetailPage;

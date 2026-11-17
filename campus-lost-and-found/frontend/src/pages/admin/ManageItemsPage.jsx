import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Search,
  Filter,
  Eye,
  Trash2,
  RotateCcw,
  CheckCircle,
  Tag,
  MapPin,
  Calendar,
  X,
  AlertTriangle,
} from 'lucide-react';

const ManageItemsPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Removal Modal State
  const [removeItem, setRemoveItem] = useState(null);
  const [removalReason, setRemovalReason] = useState('');
  const [removeLoading, setRemoveLoading] = useState(false);

  // Inspect Modal State
  const [inspectItem, setInspectItem] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catsRes, locsRes] = await Promise.all([
          api.get('/api/public/categories'),
          api.get('/api/public/locations'),
        ]);
        setCategories(catsRes.data || []);
        setLocations(locsRes.data || []);
      } catch (e) {
        console.error('Failed to load filter metadata', e);
      }
    };
    fetchMetadata();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append('query', query.trim());
      if (type) params.append('type', type);
      if (status) params.append('status', status);
      if (categoryId) params.append('categoryId', categoryId);
      if (locationId) params.append('locationId', locationId);
      params.append('page', page);
      params.append('size', 10);

      const res = await api.get(`/api/admin/items?${params.toString()}`);
      setItems(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error('Failed to load items', err);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, type, status, categoryId, locationId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchItems();
  };

  const handleRemoveSubmit = async (e) => {
    e.preventDefault();
    if (!removeItem || !removalReason.trim()) {
      toast.error('Please enter a valid removal reason');
      return;
    }

    setRemoveLoading(true);
    try {
      await api.patch(`/api/admin/items/${removeItem.id}/remove`, {
        reason: removalReason.trim(),
      });
      toast.success('Item soft-deleted and reporter notified');
      setRemoveItem(null);
      setRemovalReason('');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove item');
    } finally {
      setRemoveLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.patch(`/api/admin/items/${id}/restore`);
      toast.success('Item restored to active OPEN status');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to restore item');
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.patch(`/api/admin/items/${id}/resolve`);
      toast.success('Item marked as RESOLVED');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve item');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Item Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit lost and found filings, soft-delete improper postings with explanations, or reinstate active reports.
          </p>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearchSubmit} className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, description, or reporter..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
            >
              Filter
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); setPage(0); }}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
              >
                <option value="">All Types</option>
                <option value="LOST">LOST</option>
                <option value="FOUND">FOUND</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(0); }}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">OPEN</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="REMOVED">REMOVED</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => { setCategoryId(e.target.value); setPage(0); }}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Location</label>
              <select
                value={locationId}
                onChange={(e) => { setLocationId(e.target.value); setPage(0); }}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
              >
                <option value="">All Locations</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Items Table */}
      {loading ? (
        <LoadingSpinner text="Loading inventory records..." />
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-sm text-slate-400">
          No items found matching the selected filters.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Item</th>
                  <th className="py-4 px-6">Reporter</th>
                  <th className="py-4 px-6">Classification</th>
                  <th className="py-4 px-6">Event Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 max-w-xs">
                      <div className="flex items-center space-x-2 mb-1">
                        <StatusBadge type={item.type} />
                      </div>
                      <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                      <p className="text-xs text-slate-400 truncate">{item.description}</p>
                      {item.removalReason && (
                        <p className="text-[11px] text-amber-700 italic mt-0.5 truncate">
                          Reason: {item.removalReason}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-700 whitespace-nowrap">
                      <p className="font-medium">{item.reportedByName}</p>
                      <p className="text-slate-400 text-[11px]">{item.reportedByEmail}</p>
                    </td>

                    <td className="py-4 px-6 text-xs space-y-1">
                      <div className="flex items-center text-slate-700">
                        <Tag className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {item.categoryName}
                      </div>
                      <div className="flex items-center text-slate-500">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {item.locationName}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600 whitespace-nowrap">
                      {item.eventDate}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          onClick={() => setInspectItem(item)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {item.status === 'OPEN' && (
                          <>
                            <button
                              onClick={() => handleResolve(item.id)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition"
                              title="Mark Resolved"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setRemoveItem(item);
                                setRemovalReason('');
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                              title="Soft Delete / Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {item.status === 'REMOVED' && (
                          <button
                            onClick={() => handleRestore(item.id)}
                            className="inline-flex items-center px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                            title="Restore to active"
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1" />
                            Restore
                          </button>
                        )}
                      </div>
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

      {/* Remove Item Modal (Soft Delete with Reason) */}
      {removeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative">
            <button
              onClick={() => setRemoveItem(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Remove Item Report</h3>
                <p className="text-xs text-slate-400 truncate max-w-[260px]">{removeItem.title}</p>
              </div>
            </div>

            <form onSubmit={handleRemoveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrative Reason for Removal *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Duplicate listing, inappropriate language, prohibited item policy, or erroneous submission..."
                  value={removalReason}
                  onChange={(e) => setRemovalReason(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  This note will be logged in audit trail and dispatched to the reporter.
                </span>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRemoveItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={removeLoading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {removeLoading ? 'Removing...' : 'Confirm Removal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Item Details Modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-100 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setInspectItem(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 mb-2">
              <StatusBadge type={inspectItem.type} />
              <StatusBadge status={inspectItem.status} />
            </div>

            <h3 className="font-bold text-slate-900 text-lg mb-2">{inspectItem.title}</h3>
            <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
              {inspectItem.description}
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Reporter</span>
                <span className="font-semibold text-slate-800">{inspectItem.reportedByName} ({inspectItem.reportedByEmail})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Category</span>
                <span className="font-semibold text-slate-800">{inspectItem.categoryName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Campus Location</span>
                <span className="font-semibold text-slate-800">{inspectItem.locationName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Event Date</span>
                <span className="font-semibold text-slate-800">{inspectItem.eventDate}</span>
              </div>
              {inspectItem.removalReason && (
                <div className="p-3 bg-amber-50 rounded-xl text-amber-800 border border-amber-200 mt-2">
                  <span className="font-semibold block mb-0.5">Removal Reason:</span>
                  {inspectItem.removalReason}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setInspectItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageItemsPage;

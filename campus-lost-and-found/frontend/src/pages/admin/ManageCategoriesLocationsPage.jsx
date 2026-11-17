import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import { Layers, MapPin, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

const ManageCategoriesLocationsPage = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes, locsRes] = await Promise.all([
        api.get('/api/admin/categories'),
        api.get('/api/admin/locations'),
      ]);
      setCategories(catsRes.data || []);
      setLocations(locsRes.data || []);
    } catch (err) {
      toast.error('Failed to load categories and locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDescription(item.description || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Name is required');
      return;
    }

    setFormLoading(true);
    try {
      const endpoint = activeTab === 'categories' ? '/api/admin/categories' : '/api/admin/locations';
      const payload = { name: formName.trim(), description: formDescription.trim() || null };

      if (editingItem) {
        await api.put(`${endpoint}/${editingItem.id}`, payload);
        toast.success(`${activeTab === 'categories' ? 'Category' : 'Location'} updated successfully`);
      } else {
        await api.post(endpoint, payload);
        toast.success(`${activeTab === 'categories' ? 'Category' : 'Location'} created successfully`);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const endpoint = activeTab === 'categories' ? '/api/admin/categories' : '/api/admin/locations';
      await api.delete(`${endpoint}/${deleteTarget.id}`);
      toast.success(`${activeTab === 'categories' ? 'Category' : 'Location'} deleted successfully`);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Cannot delete item';
      toast.error(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories & Campus Locations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Maintain campus taxonomies and recognized university buildings and zones.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add New {activeTab === 'categories' ? 'Category' : 'Location'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center px-4 py-2.5 rounded-2xl text-sm font-semibold transition ${
            activeTab === 'categories'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4 mr-2" />
          Item Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`flex items-center px-4 py-2.5 rounded-2xl text-sm font-semibold transition ${
            activeTab === 'locations'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Campus Locations ({locations.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading classifications..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(activeTab === 'categories' ? categories : locations).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-6 font-mono text-xs text-slate-400">#{item.id}</td>
                  <td className="py-4 px-6 font-bold text-slate-900">{item.name}</td>
                  <td className="py-4 px-6 text-xs text-slate-500 max-w-md">
                    {item.description || 'No description provided'}
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="inline-flex items-center space-x-1.5">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingItem ? 'Edit' : 'Add New'} {activeTab === 'categories' ? 'Category' : 'Campus Location'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder={activeTab === 'categories' ? 'e.g. Eyewear & Optics' : 'e.g. West Campus Gymnasium'}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Contextual details or scope of this taxonomy..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal with Friendly In-Use Guard */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title={`Delete ${activeTab === 'categories' ? 'Category' : 'Location'}`}
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Note: If any items are currently assigned to this entry, deletion will be safely rejected by the server.`}
        confirmText="Confirm Delete"
        isDestructive={true}
        isLoading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ManageCategoriesLocationsPage;

import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Mail,
  Building,
  Phone,
  Calendar,
  X,
  Eye,
} from 'lucide-react';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Selected user for details modal
  const [selectedUser, setSelectedUser] = useState(null);

  // Block/unblock confirmation
  const [actionUser, setActionUser] = useState(null);
  const [actionType, setActionType] = useState(null); // 'block' or 'unblock'
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append('query', query.trim());
      params.append('page', page);
      params.append('size', 10);

      const res = await api.get(`/api/admin/users?${params.toString()}`);
      setUsers(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error('Failed to load users', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleBlockToggle = async () => {
    if (!actionUser) return;
    setActionLoading(true);
    try {
      if (actionType === 'block') {
        await api.patch(`/api/admin/users/${actionUser.id}/block`);
        toast.success(`User ${actionUser.fullName} has been suspended`);
      } else {
        await api.patch(`/api/admin/users/${actionUser.id}/unblock`);
        toast.success(`User ${actionUser.fullName} has been reinstated`);
      }
      setActionUser(null);
      setActionType(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Campus Members</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse registered student and staff accounts, view participation, and enforce security policies.
          </p>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or dept..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
          >
            Search
          </button>
        </form>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner text="Loading campus members list..." />
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-sm text-slate-400">
          No campus members found matching your search.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Member</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Phone</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Registered</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                          {u.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{u.fullName}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-700">
                      {u.department}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500">
                      {u.phone || '—'}
                    </td>

                    <td className="py-4 px-6">
                      {u.blocked ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 ring-1 ring-rose-600/20">
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {u.blocked ? (
                          <button
                            onClick={() => {
                              setActionUser(u);
                              setActionType('unblock');
                            }}
                            className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition"
                          >
                            <UserCheck className="w-3.5 h-3.5 mr-1" />
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setActionUser(u);
                              setActionType('block');
                            }}
                            className="inline-flex items-center px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold transition"
                          >
                            <UserX className="w-3.5 h-3.5 mr-1" />
                            Suspend
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

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center">
                {selectedUser.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{selectedUser.fullName}</h3>
                <span className="text-xs text-slate-400">{selectedUser.email}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400">Department</span>
                <span className="font-semibold text-slate-800">{selectedUser.department}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400">Phone Contact</span>
                <span className="font-semibold text-slate-800">{selectedUser.phone || 'None provided'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400">Account Standing</span>
                <span className={`font-semibold ${selectedUser.blocked ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {selectedUser.blocked ? 'Suspended' : 'In Good Standing'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400">Registered On</span>
                <span className="font-semibold text-slate-800">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block/Unblock Confirmation Dialog */}
      <ConfirmModal
        isOpen={!!actionUser}
        title={actionType === 'block' ? 'Suspend Member Account' : 'Reactivate Member Account'}
        message={
          actionType === 'block'
            ? `Are you sure you want to suspend ${actionUser?.fullName} (${actionUser?.email})? They will be locked out of the portal and cannot report items or file claims.`
            : `Are you sure you want to reinstate access for ${actionUser?.fullName}? They will be able to log in normally.`
        }
        confirmText={actionType === 'block' ? 'Suspend Account' : 'Reactivate'}
        isDestructive={actionType === 'block'}
        isLoading={actionLoading}
        onConfirm={handleBlockToggle}
        onCancel={() => {
          setActionUser(null);
          setActionType(null);
        }}
      />
    </div>
  );
};

export default ManageUsersPage;

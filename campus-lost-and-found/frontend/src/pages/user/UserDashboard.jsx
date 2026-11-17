import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Package,
  FileCheck,
  Bell,
  PlusCircle,
  Search,
  ArrowRight,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/api/user/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load user dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.fullName}!
            </h1>
            <p className="mt-1 text-sm text-indigo-100">
              Department of {user?.department || 'University Studies'} • Track your reported items and active claims
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/user/report"
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-indigo-700 hover:bg-indigo-50 shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Report Item
            </Link>
            <Link
              to="/user/browse"
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-500/40 text-white hover:bg-indigo-500/60 border border-white/20 transition"
            >
              <Search className="w-4 h-4 mr-2" />
              Browse
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="My Reported Items"
          value={data?.myReportsCount || 0}
          subtitle="Items filed by you (Lost & Found)"
          icon={Package}
          color="indigo"
        />
        <StatCard
          title="My Submitted Claims"
          value={data?.myClaimsCount || 0}
          subtitle="Claims submitted to campus desk"
          icon={FileCheck}
          color="emerald"
        />
        <StatCard
          title="Unread Alerts"
          value={data?.unreadNotificationsCount || 0}
          subtitle="Desk updates and match notices"
          icon={Bell}
          color="amber"
        />
      </div>

      {/* Two-Column Layout: Recent Reports & Recent Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Reports */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">My Recent Reports</h2>
            <Link
              to="/user/my-items"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center transition"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {!data?.recentReports || data.recentReports.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">
              You haven't reported any lost or found items yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recentReports.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between">
                  <div className="pr-3">
                    <div className="flex items-center space-x-2">
                      <StatusBadge type={item.type} />
                      <StatusBadge status={item.status} />
                    </div>
                    <Link
                      to={`/user/items/${item.id}`}
                      className="font-semibold text-slate-900 text-sm hover:text-indigo-600 mt-1 block truncate max-w-xs"
                    >
                      {item.title}
                    </Link>
                    <span className="text-xs text-slate-400 mt-0.5 block">
                      {item.locationName} • {item.eventDate}
                    </span>
                  </div>

                  <Link
                    to={`/user/items/${item.id}`}
                    className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-slate-50 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Claims */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">My Recent Claims</h2>
            <Link
              to="/user/my-claims"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center transition"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {!data?.recentClaims || data.recentClaims.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">
              You haven't submitted any claims yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recentClaims.map((claim) => (
                <div key={claim.id} className="py-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <StatusBadge type={claim.itemType} />
                      <StatusBadge claimStatus={claim.status} />
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <Link
                    to={`/user/items/${claim.itemId}`}
                    className="font-semibold text-slate-900 text-sm hover:text-indigo-600 mt-1 block truncate"
                  >
                    {claim.itemTitle}
                  </Link>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">
                    "{claim.message}"
                  </p>

                  {claim.adminRemark && (
                    <div className="mt-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-100 text-slate-700">
                      <span className="font-semibold text-slate-900">Desk Remark:</span> {claim.adminRemark}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

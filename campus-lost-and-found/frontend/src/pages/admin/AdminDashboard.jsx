import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  Package,
  Inbox,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Layers,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const res = await api.get('/api/admin/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load admin dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Aggregating campus desk telemetry..." />;
  }

  const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#64748b'];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Desk Administration Overview
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time metrics, claims mediation queue, and inventory breakdown across campus.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Users"
          value={data?.totalUsers || 0}
          subtitle="Registered members"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Total Items"
          value={data?.totalItems || 0}
          subtitle={`${data?.lostItemsCount || 0} Lost / ${data?.foundItemsCount || 0} Found`}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Pending Claims"
          value={data?.pendingClaimsCount || 0}
          subtitle="Awaiting desk review"
          icon={Inbox}
          color="amber"
        />
        <StatCard
          title="Resolved Items"
          value={data?.resolvedItemsCount || 0}
          subtitle="Successfully returned"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Categories"
          value={data?.categoryStats?.length || 0}
          subtitle="Active taxonomies"
          icon={Layers}
          color="purple"
        />
      </div>

      {/* Chart Section: Items by Category */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
              Item Distribution by Category
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of all reported items across standard campus item classifications
            </p>
          </div>
          <Link
            to="/admin/items"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            Manage inventory
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="h-72 w-full">
          {data?.categoryStats && data.categoryStats.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {data.categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No category data available yet.
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout: Claims Queue Preview & Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Claims Queue Preview */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Claims Activity</h2>
              <p className="text-xs text-slate-400">Items submitted for mediation</p>
            </div>
            <Link
              to="/admin/claims"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              Open claims queue
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {!data?.recentClaims || data.recentClaims.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No recent claims filed.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recentClaims.map((claim) => (
                <div key={claim.id} className="py-3 flex items-center justify-between">
                  <div className="pr-3">
                    <div className="flex items-center space-x-2">
                      <StatusBadge type={claim.itemType} />
                      <StatusBadge claimStatus={claim.status} />
                    </div>
                    <p className="font-semibold text-slate-900 text-sm mt-1 truncate max-w-xs">
                      {claim.itemTitle}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      Claimant: <span className="font-medium text-slate-700">{claim.claimantName}</span> ({claim.claimantEmail})
                    </p>
                  </div>

                  <Link
                    to="/admin/claims"
                    className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-slate-50 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Items Registered */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Inventory Additions</h2>
              <p className="text-xs text-slate-400">Latest lost & found entries</p>
            </div>
            <Link
              to="/admin/items"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              Manage all items
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {!data?.recentItems || data.recentItems.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No items reported yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recentItems.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div className="pr-3">
                    <div className="flex items-center space-x-2">
                      <StatusBadge type={item.type} />
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="font-semibold text-slate-900 text-sm mt-1 truncate max-w-xs">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.categoryName} • {item.locationName} • {item.eventDate}
                    </p>
                  </div>

                  <Link
                    to="/admin/items"
                    className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-slate-50 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  FileSearch,
  Handshake,
  ArrowRight,
  Sparkles,
  Users,
  Package,
  Layers,
} from 'lucide-react';
import api from '../../api/client';
import ItemCard from '../../components/common/ItemCard';
import StatCard from '../../components/common/StatCard';

const LandingPage = () => {
  const [stats, setStats] = useState({ totalItemsReported: 12, itemsReturned: 2, activeUsers: 3 });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, itemsRes] = await Promise.all([
          api.get('/api/public/stats'),
          api.get('/api/user/items?size=3&status=OPEN'),
        ]);
        setStats(statsRes.data);
        setRecentItems(itemsRes.data.content || []);
      } catch (e) {
        console.error('Failed to load landing data', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/60 via-white to-slate-50 border-b border-slate-200/60 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 text-indigo-700 text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official University Lost & Found Portal</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Reconnecting Belongings with Their Owners Across Campus
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Report lost possessions, claim items found on campus, and let our verified campus desk mediate safe recoveries.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/user/report"
              className="inline-flex items-center px-6 py-3.5 rounded-2xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Report Lost or Found Item
            </Link>

            <Link
              to="/browse"
              className="inline-flex items-center px-6 py-3.5 rounded-2xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition transform hover:-translate-y-0.5"
            >
              <Search className="w-5 h-5 mr-2 text-slate-400" />
              Browse Active Directory
            </Link>
          </div>

          {/* Secondary links */}
          <div className="mt-8 flex items-center justify-center space-x-4 text-xs font-medium text-slate-500">
            <span>Student & Staff Portal</span>
            <span>•</span>
            <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link>
            <span>•</span>
            <Link to="/register" className="text-indigo-600 hover:underline">Create Account</Link>
            <span>•</span>
            <Link to="/admin/login" className="text-slate-600 hover:underline inline-flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Desk Administration
            </Link>
          </div>
        </div>
      </section>

      {/* Live Statistics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Campus Recovery Statistics</h2>
          <p className="text-sm text-slate-500 mt-1">Live metrics recorded by the university safety desk</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Items Reported"
            value={stats.totalItemsReported}
            subtitle="Lost and found items filed on campus"
            icon={Package}
            color="indigo"
          />
          <StatCard
            title="Items Reunited / Resolved"
            value={stats.itemsReturned}
            subtitle="Verified and returned to verified owners"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Active Campus Members"
            value={stats.activeUsers}
            subtitle="Registered students, staff, and faculty"
            icon={Users}
            color="blue"
          />
        </div>
      </section>

      {/* 3-Step Process: How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How the Portal Works</h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Simple 3-step structured verification managed through the campus lost-and-found desk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm relative group hover:border-indigo-300 transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-5 group-hover:bg-indigo-600 group-hover:text-white transition">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Report an Item</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Submit details about what you lost or found, including date, location, category, and an optional photograph.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm relative group hover:border-indigo-300 transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-5 group-hover:bg-indigo-600 group-hover:text-white transition">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Claim & Verification</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              If an item matches yours, submit a claim with identifying proof. Smart suggestions help highlight potential matches.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm relative group hover:border-indigo-300 transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-5 group-hover:bg-indigo-600 group-hover:text-white transition">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Desk Mediation & Return</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Campus administration verifies the proof, approves the claim, and mediates safe collection at the central desk.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Items Preview */}
      {recentItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recently Reported Items</h2>
              <p className="text-xs text-slate-500">Latest active items submitted on campus</p>
            </div>
            <Link
              to="/browse"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center transition"
            >
              View all items
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} linkPrefix="/browse" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default LandingPage;

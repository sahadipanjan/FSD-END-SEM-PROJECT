import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Inbox,
  Package,
  Users,
  Layers,
  History,
  User,
  LogOut,
  Compass,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logoutAdmin } = useAuth();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Claims Queue', path: '/admin/claims', icon: Inbox },
    { label: 'Manage Items', path: '/admin/items', icon: Package },
    { label: 'Manage Users', path: '/admin/users', icon: Users },
    { label: 'Categories & Locations', path: '/admin/categories-locations', icon: Layers },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: History },
    { label: 'My Profile', path: '/admin/profile', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex bg-slate-100/70">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-200 bg-white transition-all duration-200 sticky top-0 h-screen ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <Link to="/admin/dashboard" className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm shadow-indigo-200">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="text-sm font-bold text-slate-900 block leading-tight">Desk Admin</span>
                <span className="text-[10px] font-medium text-slate-400 block truncate">University Portal</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  active
                    ? 'bg-indigo-50 text-indigo-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${collapsed ? 'justify-center' : 'space-x-3'}`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User info */}
        <div className="p-3 border-t border-slate-100">
          {!collapsed ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <div className="truncate pr-2">
                <p className="text-xs font-semibold text-slate-900 truncate">{admin?.fullName || 'Administrator'}</p>
                <p className="text-[10px] text-slate-400 truncate">{admin?.email || 'admin@campus.edu'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-30">
          <Link to="/admin/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">Desk Admin</span>
          </Link>
          <div className="flex items-center space-x-3">
            <Link to="/admin/claims" className="text-xs font-medium text-slate-600">Queue</Link>
            <Link to="/admin/items" className="text-xs font-medium text-slate-600">Items</Link>
            <Link to="/admin/users" className="text-xs font-medium text-slate-600">Users</Link>
            <button onClick={handleLogout} className="text-xs font-medium text-rose-600">Exit</button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

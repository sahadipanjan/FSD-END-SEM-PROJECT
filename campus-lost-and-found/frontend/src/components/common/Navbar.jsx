import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import {
  Search,
  PlusCircle,
  FolderOpen,
  FileCheck,
  User as UserIcon,
  LogOut,
  Shield,
  Menu,
  X,
  Compass,
} from 'lucide-react';

const Navbar = ({ role = 'public' }) => {
  const { user, logoutUser, admin, logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleUserLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Portal Brand */}
          <div className="flex items-center space-x-3">
            <Link to={role === 'admin' ? '/admin/dashboard' : role === 'user' ? '/user/dashboard' : '/'} className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
                <Compass className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight">
                  Campus <span className="text-indigo-600">Lost & Found</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                  {role === 'admin' ? 'Desk Administration' : 'University Portal'}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex md:items-center md:space-x-1 lg:space-x-2">
            {role === 'public' && (
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 text-sm font-medium rounded-xl transition ${
                    isActive('/') ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/browse"
                  className={`px-3 py-2 text-sm font-medium rounded-xl transition ${
                    isActive('/browse') ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Browse Items
                </Link>
                <div className="h-5 w-[1px] bg-slate-200 mx-2" />
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
                >
                  Sign Up
                </Link>
                <Link
                  to="/admin/login"
                  className="ml-2 inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  title="Administrative Desk Portal"
                >
                  <Shield className="w-3.5 h-3.5 mr-1" />
                  Admin
                </Link>
              </>
            )}

            {role === 'user' && (
              <>
                <Link
                  to="/user/dashboard"
                  className={`px-3 py-2 text-sm font-medium rounded-xl transition ${
                    isActive('/user/dashboard') ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/user/browse"
                  className={`px-3 py-2 text-sm font-medium rounded-xl transition ${
                    isActive('/user/browse') ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Browse
                </Link>
                <Link
                  to="/user/report"
                  className="inline-flex items-center px-3.5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
                >
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  Report Item
                </Link>
                <Link
                  to="/user/my-items"
                  className={`px-3 py-2 text-sm font-medium rounded-xl transition ${
                    isActive('/user/my-items') ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  My Reports
                </Link>
                <Link
                  to="/user/my-claims"
                  className={`px-3 py-2 text-sm font-medium rounded-xl transition ${
                    isActive('/user/my-claims') ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  My Claims
                </Link>

                <div className="h-5 w-[1px] bg-slate-200 mx-2" />

                {/* Notification Bell */}
                <NotificationBell />

                {/* Profile Link */}
                <Link
                  to="/user/profile"
                  className={`p-2 rounded-xl transition ${
                    isActive('/user/profile') ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
                  }`}
                  title="Profile"
                >
                  <UserIcon className="w-5 h-5" />
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleUserLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}

            {role === 'admin' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-2 text-sm font-medium rounded-xl transition ${
                    isActive('/admin/dashboard') ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/claims"
                  className={`px-3 py-2 text-sm font-medium rounded-xl transition ${
                    isActive('/admin/claims') ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Claims Queue
                </Link>
                <Link
                  to="/admin/items"
                  className={`px-3 py-2 text-sm font-medium rounded-xl transition ${
                    isActive('/admin/items') ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Items
                </Link>
                <Link
                  to="/admin/users"
                  className={`px-3 py-2 text-sm font-medium rounded-xl transition ${
                    isActive('/admin/users') ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Users
                </Link>
                <Link
                  to="/admin/categories-locations"
                  className={`px-3 py-2 text-sm font-medium rounded-xl transition ${
                    isActive('/admin/categories-locations') ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Categories & Locations
                </Link>
                <Link
                  to="/admin/audit-logs"
                  className={`px-3 py-2 text-sm font-medium rounded-xl transition ${
                    isActive('/admin/audit-logs') ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Audit Logs
                </Link>

                <div className="h-5 w-[1px] bg-slate-200 mx-2" />

                <Link
                  to="/admin/profile"
                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
                  title="Admin Profile"
                >
                  <UserIcon className="w-5 h-5" />
                </Link>

                <button
                  onClick={handleAdminLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-2">
            {role === 'user' && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {role === 'public' && (
            <>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50">Home</Link>
              <Link to="/browse" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50">Browse Items</Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50">Log In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-indigo-600 font-semibold">Sign Up</Link>
              <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-slate-500">Admin Login</Link>
            </>
          )}

          {role === 'user' && (
            <>
              <Link to="/user/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50">Dashboard</Link>
              <Link to="/user/browse" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50">Browse Items</Link>
              <Link to="/user/report" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-indigo-600 font-semibold">Report Item</Link>
              <Link to="/user/my-items" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50">My Reports</Link>
              <Link to="/user/my-claims" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50">My Claims</Link>
              <Link to="/user/profile" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50">My Profile</Link>
              <button onClick={() => { setMobileMenuOpen(false); handleUserLogout(); }} className="w-full text-left px-3 py-2 rounded-xl text-base font-medium text-rose-600">Sign Out</button>
            </>
          )}

          {role === 'admin' && (
            <>
              <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50">Dashboard</Link>
              <Link to="/admin/claims" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50">Claims Queue</Link>
              <Link to="/admin/items" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50">Manage Items</Link>
              <Link to="/admin/users" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50">Manage Users</Link>
              <Link to="/admin/categories-locations" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50">Categories & Locations</Link>
              <Link to="/admin/audit-logs" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50">Audit Logs</Link>
              <Link to="/admin/profile" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50">Profile</Link>
              <button onClick={() => { setMobileMenuOpen(false); handleAdminLogout(); }} className="w-full text-left px-3 py-2 rounded-xl text-base font-medium text-rose-600">Sign Out</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

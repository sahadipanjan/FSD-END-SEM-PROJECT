import React from 'react';
import { Compass, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Compass className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-sm font-semibold text-slate-800">
              Campus Lost & Found Portal
            </span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-500">
            <Link to="/browse" className="hover:text-indigo-600 transition">Browse Directory</Link>
            <Link to="/login" className="hover:text-indigo-600 transition">Student Login</Link>
            <Link to="/admin/login" className="hover:text-indigo-600 transition">Desk Staff</Link>
          </div>

          <div className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} University Campus Safety & Services Desk.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

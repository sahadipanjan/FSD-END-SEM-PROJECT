import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Search } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
        <Compass className="w-8 h-8 stroke-[2]" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">404</h1>
      <h2 className="mt-2 text-xl font-bold text-slate-800">Page Not Found</h2>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        The page you are looking for doesn't exist, has been moved, or you may not have permission to view it.
      </p>

      <div className="mt-6 flex items-center space-x-3">
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
        >
          <Home className="w-4 h-4 mr-2" />
          Back Home
        </Link>
        <Link
          to="/browse"
          className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
        >
          <Search className="w-4 h-4 mr-2 text-slate-400" />
          Browse Directory
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

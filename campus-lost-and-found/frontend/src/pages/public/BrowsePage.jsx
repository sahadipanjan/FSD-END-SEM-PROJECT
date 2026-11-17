import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, X, Calendar } from 'lucide-react';
import api from '../../api/client';
import ItemCard from '../../components/common/ItemCard';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const BrowsePage = ({ isUserView = false }) => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sort, setSort] = useState('newest');

  // Pagination states
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    // Load categories and locations for filter dropdowns
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
      if (categoryId) params.append('categoryId', categoryId);
      if (locationId) params.append('locationId', locationId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('sort', sort);
      params.append('page', page);
      params.append('size', 9);

      const res = await api.get(`/api/user/items?${params.toString()}`);
      setItems(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, type, categoryId, locationId, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchItems();
  };

  const handleResetFilters = () => {
    setQuery('');
    setType('');
    setCategoryId('');
    setLocationId('');
    setStartDate('');
    setEndDate('');
    setSort('newest');
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Campus Lost & Found Directory</h1>
        <p className="text-sm text-slate-500 mt-1">
          Search and filter all active items reported by students, staff, and faculty
        </p>

        {/* Search bar & Type Toggle */}
        <form onSubmit={handleSearchSubmit} className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by keyword, item name, model, or description..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
            >
              Search
            </button>
          </div>

          {/* Type Switcher Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 mr-2">Filter Type:</span>
            {[
              { label: 'All Items', value: '' },
              { label: 'Lost Items', value: 'LOST' },
              { label: 'Found Items', value: 'FOUND' },
            ].map((btn) => (
              <button
                key={btn.value}
                type="button"
                onClick={() => {
                  setType(btn.value);
                  setPage(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  type === btn.value
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}

            {/* Clear filters button */}
            {(query || type || categoryId || locationId || startDate || endDate || sort !== 'newest') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-auto inline-flex items-center text-xs font-medium text-rose-600 hover:text-rose-800 transition"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Reset filters
              </button>
            )}
          </div>

          {/* Secondary Filters row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setPage(0);
                }}
                className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
              <select
                value={locationId}
                onChange={(e) => {
                  setLocationId(e.target.value);
                  setPage(0);
                }}
                className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">All Locations</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Sort Order</label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(0);
                }}
                className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="newest">Newest Event Date First</option>
                <option value="oldest">Oldest Event Date First</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(0);
                }}
                className="w-full py-1.5 px-3 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Item List / Grid */}
      {loading ? (
        <LoadingSpinner text="Searching item catalog..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No items found"
          description="We couldn't find any lost or found items matching your search criteria. Try modifying your keywords or filters."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                linkPrefix={isUserView ? '/user/items' : '/items'}
              />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}
    </div>
  );
};

export default BrowsePage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import toast from 'react-hot-toast';
import {
  UploadCloud,
  X,
  Calendar,
  MapPin,
  Tag,
  CheckCircle,
  HelpCircle,
  PhoneCall,
  Image as ImageIcon,
} from 'lucide-react';

const ReportItemPage = () => {
  const navigate = useNavigate();

  const [type, setType] = useState('LOST');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [contactPreference, setContactPreference] = useState('Campus Desk');

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [catsRes, locsRes] = await Promise.all([
          api.get('/api/public/categories'),
          api.get('/api/public/locations'),
        ]);
        setCategories(catsRes.data || []);
        setLocations(locsRes.data || []);
        if (catsRes.data?.length > 0) setCategoryId(catsRes.data[0].id);
        if (locsRes.data?.length > 0) setLocationId(locsRes.data[0].id);
      } catch (e) {
        console.error('Failed to load categories/locations', e);
      }
    };
    fetchDropdowns();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be 5 MB or less.');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      toast.error('Only JPG, PNG, and WebP images are allowed.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !categoryId || !locationId || !eventDate) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('categoryId', categoryId);
      formData.append('locationId', locationId);
      formData.append('eventDate', eventDate);
      formData.append('contactPreference', contactPreference);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await api.post('/api/user/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(`${type === 'LOST' ? 'Lost' : 'Found'} item reported successfully!`);
      navigate(`/user/items/${response.data.id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit report. Please review your input.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
        {/* Header */}
        <div className="border-b border-slate-100 pb-6">
          <h1 className="text-2xl font-bold text-slate-900">Report an Item</h1>
          <p className="text-sm text-slate-500 mt-1">
            Fill in the details below to log your lost property or submit something you found on campus.
          </p>

          {/* Type Toggle Switch */}
          <div className="mt-6 flex p-1 bg-slate-100 rounded-2xl w-full sm:w-80">
            <button
              type="button"
              onClick={() => setType('LOST')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
                type === 'LOST'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              I Lost Something
            </button>
            <button
              type="button"
              onClick={() => setType('FOUND')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
                type === 'FOUND'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              I Found Something
            </button>
          </div>
        </div>

        {error && (
          <div className="my-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Item Title / Short Summary *
            </label>
            <input
              type="text"
              required
              placeholder={type === 'LOST' ? 'e.g. Blue HydroFlask 32oz' : 'e.g. Found Black Lenovo Charger in Turing Lab'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe color, stickers, model number, identifiable scratches, unique marks, contents..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campus Location *
              </label>
              <select
                required
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Contact Preference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date {type === 'LOST' ? 'Lost' : 'Found'} *
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Preference
              </label>
              <select
                value={contactPreference}
                onChange={(e) => setContactPreference(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              >
                <option value="Campus Desk">Campus Lost & Found Desk</option>
                <option value="Email">Direct Institutional Email</option>
                <option value="Phone">Phone / WhatsApp</option>
              </select>
            </div>
          </div>

          {/* Photo Upload with Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Item Photograph (Optional, max 5 MB - JPG, PNG, WebP)
            </label>

            {imagePreview ? (
              <div className="relative mt-2 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-w-sm">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-xl transition"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="mt-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition">
                <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-indigo-600">Click to upload photo</span>
                <span className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WebP up to 5 MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md transition disabled:opacity-50 ${
                type === 'LOST'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
              }`}
            >
              {loading ? 'Submitting Report...' : `Publish ${type === 'LOST' ? 'Lost' : 'Found'} Report`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportItemPage;

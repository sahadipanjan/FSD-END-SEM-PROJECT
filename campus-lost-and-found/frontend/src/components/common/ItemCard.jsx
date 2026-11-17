import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Tag, Calendar, User, ArrowRight, ImageOff } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { API_BASE_URL } from '../../api/client';

const ItemCard = ({ item, linkPrefix = '/user/items' }) => {
  const imageUrl = item.imagePath ? `${API_BASE_URL}${item.imagePath}` : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Image / Banner */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.parentNode.classList.add('bg-slate-100');
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300">
            <ImageOff className="w-10 h-10 stroke-[1.5]" />
            <span className="text-xs text-slate-400 mt-1">No photo provided</span>
          </div>
        )}

        {/* Badges in image overlay */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
          <StatusBadge type={item.type} />
        </div>
        <div className="absolute top-3 right-3">
          <StatusBadge status={item.status} />
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1.5">
            <span className="inline-flex items-center">
              <Tag className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {item.categoryName}
            </span>
            <span>•</span>
            <span className="inline-flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {item.locationName}
            </span>
          </div>

          <h3 className="font-semibold text-slate-900 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {item.title}
          </h3>

          <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {item.eventDate}
            </span>
            {item.reportedByName && (
              <span className="inline-flex items-center truncate max-w-[120px]">
                <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {item.reportedByName}
              </span>
            )}
          </div>

          <Link
            to={`${linkPrefix}/${item.id}`}
            className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
          >
            Details
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;

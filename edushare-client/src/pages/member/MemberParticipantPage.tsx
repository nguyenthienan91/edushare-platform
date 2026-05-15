import { useState } from 'react';

import {
  Search,
  Star,
  Users,
  Crown,
  CheckCircle2,
} from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';

const listings = [
  {
    id: '1',
    ownerId: 'owner1',
    platform: 'Netflix Premium',
    type: 'Video',
    totalSlots: 4,
    availableSlots: 2,
    pricePerSlot: 4.5,
    duration: 'monthly',
    rules: 'No changing password',
    status: 'active',
    rating: 4.8,
  },
  {
    id: '2',
    ownerId: 'owner1',
    platform: 'Spotify Family',
    type: 'Audio',
    totalSlots: 5,
    availableSlots: 3,
    pricePerSlot: 3.0,
    duration: 'monthly',
    rules: 'Must live in same country',
    status: 'active',
    rating: 5.0,
  },
  {
    id: '3',
    ownerId: 'owner3',
    platform: 'ChatGPT Plus',
    type: 'AI',
    totalSlots: 3,
    availableSlots: 1,
    pricePerSlot: 7.0,
    duration: 'monthly',
    rules: 'Shared account, fair usage',
    status: 'active',
    rating: 4.5,
  },
];

export default function MemberParticipantPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredListings = listings.filter((listing) =>
    listing.platform.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Thành viên tham gia
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Danh sách nhóm đang hoạt động.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

          <input
            type="text"
            placeholder="Tìm nền tảng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        <AnimatePresence>

          {filteredListings.map((listing) => (

            <motion.div
              key={listing.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >

              <div className="p-5 flex-1">

                {/* Top */}
                <div className="flex justify-between items-start mb-4">

                  <div>
                    <div className="font-bold text-lg text-slate-900">
                      {listing.platform}
                    </div>

                    <div className="text-sm text-slate-500 mt-1">
                      {listing.type}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-md text-xs font-semibold border border-amber-100">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {listing.rating}
                  </div>

                </div>

                {/* Info */}
                <div className="space-y-3 mb-4">

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Chủ nhóm:
                    </span>

                    <span className="font-medium text-slate-700 flex items-center gap-1">
                      <Crown className="w-4 h-4 text-amber-500" />
                      {listing.ownerId}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Thành viên:
                    </span>

                    <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {listing.totalSlots - listing.availableSlots}/
                      {listing.totalSlots}
                    </span>
                  </div>

                </div>

                {/* Rules */}
                <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 border border-slate-100">
                  <span className="font-semibold block mb-1">
                    Quy tắc:
                  </span>

                  <span className="line-clamp-2">
                    {listing.rules}
                  </span>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between mt-auto">

                <div>
                  <div className="text-xs text-slate-500 mb-0.5">
                    Trạng thái
                  </div>

                  <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Hoạt động
                  </div>
                </div>

                <button className="px-5 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                  Xem nhóm
                </button>

              </div>

            </motion.div>

          ))}

        </AnimatePresence>

      </div>
    </div>
  );
}
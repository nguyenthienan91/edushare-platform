import { useState } from 'react';
import {
  Search,
  Filter,
  Star,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Listing {
  id: string;
  platform: string;
  type: string;
  totalSlots: number;
  availableSlots: number;
  pricePerSlot: number;
  duration: string;
  rules: string;
  rating: number;
}

export default function MemberParticipantPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const [showVipPopup, setShowVipPopup] = useState(false);

  const [listings, setListings] = useState<Listing[]>([
    {
      id: '1',
      platform: 'Netflix Premium',
      type: 'Video',
      totalSlots: 4,
      availableSlots: 2,
      pricePerSlot: 4.5,
      duration: 'monthly',
      rules: 'Không đổi mật khẩu',
      rating: 4.8,
    },
    {
      id: '2',
      platform: 'Spotify Family',
      type: 'Music',
      totalSlots: 5,
      availableSlots: 3,
      pricePerSlot: 3,
      duration: 'monthly',
      rules: 'Cùng quốc gia',
      rating: 5,
    },
    {
      id: '3',
      platform: 'ChatGPT Plus',
      type: 'AI',
      totalSlots: 3,
      availableSlots: 1,
      pricePerSlot: 7,
      duration: 'monthly',
      rules: 'Fair usage',
      rating: 4.6,
    },
  ]);

  const activeListings = listings.filter(
    (item) =>
      item.availableSlots > 0 &&
      item.platform.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJoin = (listing: Listing) => {
    if (user?.role?.toLowerCase() === 'guest') {
      setShowVipPopup(true);
      return;
    }
    setSelectedListing(listing);
    setShowPopup(true);
    setAcceptedTerms(false);
  };

  const confirmJoin = () => {
    if (!selectedListing) return;

    setListings((prev) =>
      prev.map((item) =>
        item.id === selectedListing.id
          ? {
              ...item,
              availableSlots: item.availableSlots - 1,
            }
          : item
      )
    );

    alert('Thanh toán thành công!');

    setShowPopup(false);
    setSelectedListing(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold ">
            Thị trường đăng ký
          </h1>

          <p className="text-sm  mt-1">
            Tìm và tham gia nhóm chia sẻ tài khoản an toàn
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              placeholder="Tìm Netflix, Spotify..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button className="px-3 py-2 border border-slate-200 rounded-lg  hover: flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:block text-sm">Bộ lọc</span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {activeListings.map((listing) => (
            <motion.div
              key={listing.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className=" rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="p-5">
                {/* Top */}
                <div className="flex justify-between mb-4">
                  <h2 className="font-bold text-lg">
                    {listing.platform}
                  </h2>

                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded text-xs">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {listing.rating}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="">Loại</span>
                    <span>{listing.type}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="">Kỳ hạn</span>
                    <span>{listing.duration}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="">Slot</span>
                    <span className="text-emerald-600 font-semibold">
                      {listing.availableSlots}/{listing.totalSlots}
                    </span>
                  </div>
                </div>

                {/* Rules */}
                <div className=" p-3 rounded-lg text-xs ">
                  <span className="font-semibold block mb-1">
                    Quy tắc:
                  </span>

                  {listing.rules}
                </div>
              </div>

              {/* Bottom */}
              <div className="border-t border-slate-100 p-4 flex items-center justify-between ">
                <div>
                  <div className="text-xs ">
                    Giá mỗi slot
                  </div>

                  <div className="font-bold text-lg">
                    ${listing.pricePerSlot}
                  </div>
                </div>

                <button
                  onClick={() => handleJoin(listing)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                  Tham gia
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Popup */}
      <AnimatePresence>
        {showPopup && selectedListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className=" rounded-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="bg-amber-50 p-6 text-center border-b border-amber-100">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>

                <h3 className="font-bold text-lg text-amber-900">
                  Cảnh báo pháp lý
                </h3>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className=" border border-slate-200 rounded-lg p-4 text-sm  mb-5">
                  Share Hub chỉ là nền tảng hỗ trợ chia sẻ chi phí,
                  không bán tài khoản.
                </div>

                {/* Checkbox */}
                <div className="flex items-start gap-3 mb-6">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) =>
                      setAcceptedTerms(e.target.checked)
                    }
                    className="mt-1"
                  />

                  <p className="text-sm ">
                    Tôi đồng ý với điều khoản sử dụng.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPopup(false)}
                    className="flex-1 py-2 border border-slate-200 rounded-lg"
                  >
                    Hủy
                  </button>

                  <button
                    disabled={!acceptedTerms}
                    onClick={confirmJoin}
                    className="flex-1 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    Thanh toán
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIP Popup */}
      <AnimatePresence>
        {showVipPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setShowVipPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-slate-900">Nâng cấp gói VIP</h3>
                <p className="mb-6 text-sm text-slate-600">
                  Tính năng này chỉ dành cho thành viên VIP. Bạn cần nâng cấp lên gói VIP (29.000đ) để có thể tham gia vào các nhóm chia sẻ tài khoản.
                </p>
                <div className="flex w-full flex-col gap-3">
                  <button
                    onClick={() => {
                      setShowVipPopup(false);
                      navigate('/dashboard/wallet');
                    }}
                    className="flex w-full items-center justify-center rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                  >
                    Nâng cấp VIP ngay
                  </button>
                  <button
                    onClick={() => setShowVipPopup(false)}
                    className="flex w-full items-center justify-center rounded-2xl border border-slate-200 py-3 text-sm font-semibold transition hover:bg-slate-50"
                  >
                    Để sau
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState } from 'react';

import {
  Star,
  ThumbsUp,
  MessageSquare,
  Filter,
  Search,
} from 'lucide-react';

interface Review {
  id: string;
  orderId: string;
  platform: string;
  rating: number;
  comment: string;
  reviewerName: string;
  reviewerRole: 'owner' | 'participant';
  date: string;
  helpful: number;
  canRespond: boolean;
  response?: string;
}

export default function MemberReviewsPage() {
  const currentUser = {
    role: 'participant',
  };

  const [filter, setFilter] = useState<
    'all' | 'received' | 'given'
  >('all');

  const [ratingFilter, setRatingFilter] =
    useState('all');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [reviews] = useState<Review[]>([
    {
      id: '1',
      orderId: 'ORD-001',
      platform: 'Netflix Premium',
      rating: 5,
      comment:
        'Chủ sở hữu rất uy tín và hỗ trợ nhanh chóng.',
      reviewerName: 'Nguyễn Văn A',
      reviewerRole: 'participant',
      date: '2026-05-15',
      helpful: 12,
      canRespond: true,
    },

    {
      id: '2',
      orderId: 'ORD-002',
      platform: 'Spotify Family',
      rating: 4,
      comment:
        'Thanh toán đúng hạn, giao dịch ổn định.',
      reviewerName: 'Trần Thị B',
      reviewerRole: 'owner',
      date: '2026-05-14',
      helpful: 5,
      canRespond: false,
      response: 'Cảm ơn bạn rất nhiều!',
    },

    {
      id: '3',
      orderId: 'ORD-003',
      platform: 'ChatGPT Plus',
      rating: 5,
      comment:
        'Rất tuyệt vời, sẽ tiếp tục tham gia.',
      reviewerName: 'Lê Văn C',
      reviewerRole: 'participant',
      date: '2026-05-10',
      helpful: 15,
      canRespond: true,
    },
  ]);

  const filteredReviews = reviews.filter(
    (review) => {
      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'received'
          ? review.reviewerRole !== currentUser.role
          : review.reviewerRole === currentUser.role;

      const matchesRating =
        ratingFilter === 'all' ||
        review.rating === Number(ratingFilter);

      const matchesSearch =
        review.platform
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        review.comment
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return (
        matchesFilter &&
        matchesRating &&
        matchesSearch
      );
    }
  );

  const stats = {
    total: reviews.length,

    averageRating: (
      reviews.reduce((acc, r) => acc + r.rating, 0) /
      reviews.length
    ).toFixed(1),

    fiveStar: reviews.filter((r) => r.rating === 5)
      .length,

    fourStar: reviews.filter((r) => r.rating === 4)
      .length,

    threeStar: reviews.filter((r) => r.rating === 3)
      .length,

    twoStar: reviews.filter((r) => r.rating === 2)
      .length,

    oneStar: reviews.filter((r) => r.rating === 1)
      .length,
  };

  const StarRating = ({
    rating,
  }: {
    rating: number;
  }) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-slate-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const RatingBar = ({
    label,
    count,
    total,
  }: {
    label: string;
    count: number;
    total: number;
  }) => {
    const percentage = (count / total) * 100;

    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600 w-12">
          {label}
        </span>

        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 rounded-full"
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>

        <span className="text-sm text-slate-500 w-8 text-right">
          {count}
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Đánh giá & Xếp hạng
        </h1>

        <p className="text-slate-600">
          Quản lý đánh giá từ giao dịch của bạn
        </p>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left */}
          <div className="text-center lg:text-left">
            <div className="flex items-end justify-center lg:justify-start gap-2 mb-2">
              <span className="text-5xl font-bold text-slate-900">
                {stats.averageRating}
              </span>

              <span className="text-slate-500 mb-2">
                / 5.0
              </span>
            </div>

            <div className="flex justify-center lg:justify-start mb-2">
              <StarRating
                rating={Math.round(
                  Number(stats.averageRating)
                )}
              />
            </div>

            <p className="text-slate-600">
              Dựa trên {stats.total} đánh giá
            </p>
          </div>

          {/* Right */}
          <div className="space-y-2">
            <RatingBar
              label="5 sao"
              count={stats.fiveStar}
              total={stats.total}
            />

            <RatingBar
              label="4 sao"
              count={stats.fourStar}
              total={stats.total}
            />

            <RatingBar
              label="3 sao"
              count={stats.threeStar}
              total={stats.total}
            />

            <RatingBar
              label="2 sao"
              count={stats.twoStar}
              total={stats.total}
            />

            <RatingBar
              label="1 sao"
              count={stats.oneStar}
              total={stats.total}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              placeholder="Tìm kiếm đánh giá..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200'
              }`}
            >
              Tất cả
            </button>

            <button
              onClick={() => setFilter('received')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'received'
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200'
              }`}
            >
              Nhận được
            </button>

            <button
              onClick={() => setFilter('given')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'given'
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200'
              }`}
            >
              Đã cho
            </button>
          </div>

          {/* Select */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <select
              value={ratingFilter}
              onChange={(e) =>
                setRatingFilter(e.target.value)
              }
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value="all">Tất cả</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Star className="w-12 h-12 mx-auto mb-3 text-slate-300" />

            <p className="font-medium text-slate-700 mb-1">
              Không có đánh giá
            </p>

            <p className="text-sm text-slate-500">
              Không tìm thấy đánh giá phù hợp
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-emerald-700">
                    {review.reviewerName.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900">
                        {review.reviewerName}
                      </span>

                      <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-600">
                        {review.reviewerRole ===
                        'owner'
                          ? 'Chủ sở hữu'
                          : 'Người tham gia'}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500">
                      Đơn hàng: {review.orderId}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <StarRating
                    rating={review.rating}
                  />

                  <p className="text-xs text-slate-500 mt-1">
                    {review.date}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <p className="text-slate-700 mb-3">
                  {review.comment}
                </p>

                <span className="px-2 py-1 rounded-full border border-slate-200 text-xs">
                  {review.platform}
                </span>
              </div>

              {/* Response */}
              {review.response && (
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mb-4">
                  <p className="text-xs font-semibold text-slate-600 mb-1">
                    Phản hồi từ bạn:
                  </p>

                  <p className="text-sm text-slate-700">
                    {review.response}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600 transition">
                  <ThumbsUp className="w-4 h-4" />

                  Hữu ích ({review.helpful})
                </button>

                {review.canRespond &&
                  !review.response && (
                    <button className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-emerald-600 transition">
                      <MessageSquare className="w-4 h-4" />

                      Phản hồi
                    </button>
                  )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
// export default function MemberParticipantOrdersPage() {
//   return (
//     <div className='rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm'>
//       <div className='space-y-3'>
//         {['Đơn #A1023 - Chờ xác nhận', 'Đơn #A1021 - Đã thanh toán', 'Đơn #A1018 - Đang hoàn tất'].map((item) => (
//           <div key={item} className='rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700'>
//             {item}
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }
import React, { useState } from 'react';

import {
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  FileWarning,
  Eye,
  RefreshCw,
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

interface Order {
  id: string;
  platform: string;
  price: number;
  status:
    | 'confirmed'
    | 'pending_access'
    | 'released'
    | 'disputed'
    | 'refunded';

  createdAt: string;
}

const statusMap = {
  confirmed: {
    label: 'Đã xác nhận',
    color: 'bg-blue-100 text-blue-700',
  },

  pending_access: {
    label: 'Chờ truy cập',
    color: 'bg-amber-100 text-amber-700',
  },

  released: {
    label: 'Đã cấp & giải ngân',
    color: 'bg-emerald-100 text-emerald-700',
  },

  disputed: {
    label: 'Tranh chấp',
    color: 'bg-red-100 text-red-700',
  },

  refunded: {
    label: 'Đã hoàn tiền',
    color: 'bg-purple-100 text-purple-700',
  },
};

export default function MemberParticipantOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD001',
      platform: 'Netflix Premium',
      price: 4.5,
      status: 'confirmed',
      createdAt: '2026-05-15',
    },

    {
      id: 'ORD002',
      platform: 'Spotify Family',
      price: 3,
      status: 'pending_access',
      createdAt: '2026-05-14',
    },

    {
      id: 'ORD003',
      platform: 'ChatGPT Plus',
      price: 7,
      status: 'released',
      createdAt: '2026-05-10',
    },
  ]);

  const [showDisputeModal, setShowDisputeModal] =
    useState<string | null>(null);

  const confirmAccess = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: 'released' }
          : order
      )
    );

    alert('Xác nhận truy cập thành công!');
  };

  const submitDispute = (
    e: React.FormEvent,
    orderId: string
  ) => {
    e.preventDefault();

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: 'disputed' }
          : order
      )
    );

    setShowDisputeModal(null);

    alert('Đã gửi báo cáo!');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Đơn hàng của tôi
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Theo dõi trạng thái các gói đăng ký
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="px-6 py-4 text-left">
                    Mã đơn
                  </th>

                  <th className="px-6 py-4 text-left">
                    Nền tảng
                  </th>

                  <th className="px-6 py-4 text-center">
                    Giá
                  </th>

                  <th className="px-6 py-4 text-center">
                    Trạng thái
                  </th>

                  <th className="px-6 py-4 text-right">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {orders.map((order) => (
                    <motion.tr
                      key={order.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50"
                    >
                      {/* ID */}
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono">
                          #{order.id}
                        </span>
                      </td>

                      {/* Platform */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {order.platform}
                        </div>

                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />

                          {new Date(
                            order.createdAt
                          ).toLocaleDateString('vi-VN')}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 text-center font-semibold text-emerald-600">
                        ${order.price}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            statusMap[order.status].color
                          }`}
                        >
                          {statusMap[order.status].label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {order.status === 'confirmed' && (
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded flex items-center gap-1 text-slate-600">
                              <RefreshCw className="w-3 h-3 animate-spin" />

                              Chờ cấp quyền
                            </span>
                          )}

                          {order.status ===
                            'pending_access' && (
                            <>
                              <button
                                onClick={() =>
                                  confirmAccess(order.id)
                                }
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />

                                Thành công
                              </button>

                              <button
                                onClick={() =>
                                  setShowDisputeModal(
                                    order.id
                                  )
                                }
                                className="px-3 py-1.5 bg-red-50 text-red-700 rounded text-xs font-semibold border border-red-200 hover:bg-red-100 flex items-center gap-1"
                              >
                                <FileWarning className="w-3 h-3" />

                                Báo cáo
                              </button>
                            </>
                          )}

                          {(order.status === 'released' ||
                            order.status ===
                              'disputed' ||
                            order.status ===
                              'refunded') && (
                            <button className="p-2 border border-slate-200 rounded hover:bg-slate-50">
                              <Eye className="w-4 h-4 text-slate-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-500">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-slate-300" />

            <p className="text-lg font-medium">
              Chưa có đơn hàng
            </p>

            <p className="text-sm">
              Hãy tham gia một gói đăng ký
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showDisputeModal && (
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
              className="bg-white rounded-2xl w-full max-w-lg overflow-hidden"
            >
              <form
                onSubmit={(e) =>
                  submitDispute(e, showDisputeModal)
                }
              >
                {/* Header */}
                <div className="bg-red-50 p-6 border-b border-red-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>

                  <div>
                    <h3 className="font-bold text-red-900 text-lg">
                      Báo cáo sự cố
                    </h3>

                    <p className="text-sm text-red-700 mt-1">
                      Tiền sẽ bị đóng băng cho đến khi xử lý
                    </p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold">
                      Lý do
                    </label>

                    <select
                      required
                      className="w-full mt-2 px-4 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="">
                        -- Chọn lý do --
                      </option>

                      <option>
                        Không đăng nhập được
                      </option>

                      <option>
                        Chủ tài khoản không phản hồi
                      </option>

                      <option>Tài khoản bị khóa</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold">
                      Mô tả chi tiết
                    </label>

                    <textarea
                      required
                      rows={4}
                      placeholder="Nhập mô tả..."
                      className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-lg resize-none"
                    />
                  </div>

                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50">
                    <ShieldCheck className="w-8 h-8 mx-auto text-slate-400 mb-2" />

                    <p className="text-sm font-medium">
                      Tải ảnh bằng chứng
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      PNG hoặc JPG
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setShowDisputeModal(null)
                    }
                    className="px-5 py-2 border border-slate-200 rounded-lg"
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <FileWarning className="w-4 h-4" />

                    Gửi báo cáo
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
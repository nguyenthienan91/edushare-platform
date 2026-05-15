// export default function MemberWalletPage() {
//   return (
//     <div className='grid gap-4 md:grid-cols-3'>
//       {[
//         { label: 'Số dư hiện tại', value: '$45.20' },
//         { label: 'Đã nạp', value: '$120.00' },
//         { label: 'Đã chi', value: '$74.80' }
//       ].map((item) => (
//         <div key={item.label} className='rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm'>
//           <p className='text-sm text-slate-500'>{item.label}</p>
//           <p className='mt-2 text-3xl font-semibold text-slate-900'>{item.value}</p>
//         </div>
//       ))}
//     </div>
//   )
// }

import React, { useState } from 'react';

import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Clock,
} from 'lucide-react';

interface Order {
  id: string;
  platform: string;
  participantId: string;
  ownerId: string;
  price: number;

  status:
    | 'confirmed'
    | 'pending_access'
    | 'released'
    | 'disputed'
    | 'refunded';

  createdAt: string;
}

export default function MemberWalletPage() {
  // Fake current user
  const currentUser = {
    id: 'user_1',
    name: 'John Doe',
    walletBalance: 120.5,
  };

  // Fake orders
  const [orders] = useState<Order[]>([
    {
      id: 'ORD001',
      platform: 'Netflix Premium',
      participantId: 'user_1',
      ownerId: 'owner_1',
      price: 4.5,
      status: 'confirmed',
      createdAt: '2026-05-15',
    },

    {
      id: 'ORD002',
      platform: 'Spotify Family',
      participantId: 'owner_2',
      ownerId: 'user_1',
      price: 3,
      status: 'pending_access',
      createdAt: '2026-05-14',
    },

    {
      id: 'ORD003',
      platform: 'ChatGPT Plus',
      participantId: 'user_1',
      ownerId: 'owner_3',
      price: 7,
      status: 'released',
      createdAt: '2026-05-10',
    },
  ]);

  // Orders đang escrow
  const myEscrowOrders = orders.filter(
    (order) =>
      (order.ownerId === currentUser.id ||
        order.participantId === currentUser.id) &&
      (order.status === 'confirmed' ||
        order.status === 'pending_access' ||
        order.status === 'disputed')
  );

  const totalEscrow = myEscrowOrders.reduce(
    (sum, order) => sum + order.price,
    0
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
          <WalletIcon className="w-5 h-5 text-white" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Ví ký quỹ
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Quản lý số dư và giao dịch
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />

          <div className="relative z-10">
            <div className="text-slate-400 text-sm mb-2">
              Số dư khả dụng
            </div>

            <div className="text-5xl font-extrabold mb-8">
              ${currentUser.walletBalance.toFixed(2)}
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-white text-slate-900 py-3 rounded-xl font-semibold text-sm hover:bg-slate-100 transition flex items-center justify-center gap-2">
                <ArrowDownLeft className="w-4 h-4" />

                Nạp tiền
              </button>

              <button className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-semibold text-sm border border-white/10 transition flex items-center justify-center gap-2">
                <ArrowUpRight className="w-4 h-4" />

                Rút tiền
              </button>
            </div>
          </div>
        </div>

        {/* Escrow */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />

              Đang giữ trong ký quỹ
            </div>

            <div className="text-4xl font-extrabold text-slate-900 mb-2">
              ${totalEscrow.toFixed(2)}
            </div>

            <p className="text-sm text-slate-500 leading-relaxed">
              Tiền sẽ được giải ngân khi xác nhận truy cập
              thành công hoặc sau khi xử lý tranh chấp.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Giao dịch chờ xử lý
            </span>

            <span className="font-semibold text-slate-900">
              {myEscrowOrders.length} giao dịch
            </span>
          </div>
        </div>
      </div>

      {/* History */}
      <h2 className="text-lg font-bold text-slate-900 mt-10 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-slate-400" />

        Lịch sử giao dịch
      </h2>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {orders.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {orders.map((order) => {
              const isOutgoing =
                order.participantId === currentUser.id;

              return (
                <div
                  key={order.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition"
                >
                  {/* Left */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isOutgoing
                          ? 'bg-red-50 text-red-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {isOutgoing ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="font-semibold text-slate-900">
                        {isOutgoing
                          ? `Thanh toán ${order.platform}`
                          : `Thu nhập ${order.platform}`}
                      </div>

                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <span>
                          {new Date(
                            order.createdAt
                          ).toLocaleDateString('vi-VN')}
                        </span>

                        <span className="w-1 h-1 rounded-full bg-slate-300" />

                        <span className="uppercase text-[10px] tracking-wider font-semibold">
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div
                    className={`font-bold ${
                      isOutgoing
                        ? 'text-slate-900'
                        : 'text-emerald-600'
                    }`}
                  >
                    {isOutgoing ? '-' : '+'}$
                    {order.price.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            Chưa có giao dịch nào
          </div>
        )}
      </div>
    </div>
  );
}
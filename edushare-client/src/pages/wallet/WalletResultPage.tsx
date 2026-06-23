import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Wallet, ArrowRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export default function WalletResultPage() {
  const [searchParams] = useSearchParams()

  const status = searchParams.get('status')
  const code = searchParams.get('code')
  const cancel = searchParams.get('cancel')
  const transactionId = searchParams.get('id')
  const orderCode = searchParams.get('orderCode')

  // Xác định trạng thái thanh toán từ PayOS
  // Nếu tham số cancel là 'true' hoặc status chứa thông tin cancel, thì chắc chắn là HỦY
  const isCancelled =
    cancel === 'true' ||
    status === 'cancel' ||
    status === 'CANCEL' ||
    status === 'CANCELLED'

  // Thành công khi không phải là hủy và có mã trạng thái PAID/success hoặc code 00
  const isSuccess =
    !isCancelled &&
    (status === 'success' || status === 'PAID' || code === '00')

  // Biến thể hoạt ảnh cho Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
        staggerChildren: 0.1,
      },
    },
  }

  const childVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } },
  }

  const iconVariants = {
    hidden: { scale: 0, rotate: -45 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { type: 'spring' as const, stiffness: 200, delay: 0.2 },
    },
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-4 bg-radial-gradient">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md"
      >
        <Card className="relative overflow-hidden w-full shadow-2xl rounded-3xl border-border/60 bg-background/60 backdrop-blur-2xl">
          {/* Lớp phủ Gradient mờ cho cảm giác hiện đại */}
          <div className="absolute inset-0 bg-linear-to-b from-white/5 to-white/0 pointer-events-none" />

          <CardHeader className="text-center pt-10 pb-4 relative z-10">
            {/* Hiển thị Icon và Hiệu ứng tương ứng */}
            <div className="flex justify-center mb-6">
              {isSuccess ? (
                <motion.div
                  variants={iconVariants}
                  className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                >
                  <CheckCircle2 className="h-14 w-14" />
                  <span className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping opacity-75" />
                </motion.div>
              ) : isCancelled ? (
                <motion.div
                  variants={iconVariants}
                  className="relative flex h-24 w-24 items-center justify-center rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.2)]"
                >
                  <XCircle className="h-14 w-14" />
                  <span className="absolute inset-0 rounded-full border-2 border-rose-500/30 animate-pulse opacity-75" />
                </motion.div>
              ) : (
                <motion.div
                  variants={iconVariants}
                  className="relative flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                >
                  <Wallet className="h-12 w-12 animate-pulse" />
                </motion.div>
              )}
            </div>

            <motion.div variants={childVariants}>
              <CardTitle className="text-2xl font-bold tracking-tight px-4 leading-normal">
                {isSuccess
                  ? 'Nạp tiền thành công!'
                  : isCancelled
                  ? 'Giao dịch đã bị hủy'
                  : 'Trạng thái giao dịch không xác định'}
              </CardTitle>
            </motion.div>

            <motion.div variants={childVariants} className="mt-2">
              <CardDescription className="text-sm text-muted-foreground px-6">
                {isSuccess
                  ? 'Chúc mừng! Số tiền nạp đã được ghi nhận thành công vào tài khoản ví của bạn.'
                  : isCancelled
                  ? 'Bạn đã hủy bỏ giao dịch nạp tiền. Tiền chưa được trừ từ tài khoản ngân hàng của bạn.'
                  : 'Yêu cầu thanh toán của bạn đang được kiểm tra hoặc thông số URL không hợp lệ.'}
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="pt-2 pb-6 px-6 relative z-10">
            {/* Hộp thông tin chi tiết giao dịch */}
            {(orderCode || transactionId) && (
              <motion.div
                variants={childVariants}
                className="rounded-2xl border border-border/40 bg-muted/40 p-5 space-y-3.5 backdrop-blur-xs text-sm"
              >
                {orderCode && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Mã đơn hàng:</span>
                    <span className="font-bold text-foreground tracking-wide font-mono">{orderCode}</span>
                  </div>
                )}
                {transactionId && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-muted-foreground font-medium shrink-0">Mã giao dịch:</span>
                    <span className="font-semibold text-right text-muted-foreground/90 break-all select-all font-mono">
                      {transactionId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-border/30 pt-3">
                  <span className="text-muted-foreground font-medium">Trạng thái:</span>
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${
                      isSuccess
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : isCancelled
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}
                  >
                    {isSuccess ? 'ĐÃ THANH TOÁN' : isCancelled ? 'ĐÃ HỦY BỎ' : 'CHỜ XỬ LÝ'}
                  </span>
                </div>
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pb-10 px-6 relative z-10">
            <motion.div variants={childVariants} className="w-full">
              <Button asChild className="w-full py-6 text-base font-semibold rounded-2xl group transition-all duration-200">
                <Link to="/dashboard/wallet">
                  <Wallet className="mr-2 size-5 transition-transform group-hover:scale-110" />
                  Về trang ví của tôi
                  <ArrowRight className="ml-1.5 size-4 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                </Link>
              </Button>
            </motion.div>

            <motion.div variants={childVariants} className="w-full">
              <Button asChild variant="outline" className="w-full py-6 text-base font-medium rounded-2xl border-border/80 hover:bg-muted/80">
                <Link to="/dashboard/overview">
                  <Home className="mr-2 size-4.5" />
                  Quay lại tổng quan
                </Link>
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

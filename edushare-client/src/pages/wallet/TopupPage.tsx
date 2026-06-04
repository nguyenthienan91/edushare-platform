import { useState } from 'react';
import { PaymentService } from '@/services/payment.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export default function TopupPage() {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTopup = async () => {
    const value = Number(amount);
    if (!value || value < 10000) return;
    setIsSubmitting(true);
    try {
      const response = await PaymentService.createDepositLink(value);
      if (response && response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl border-border/60 bg-background/50 backdrop-blur-xl">
        <CardHeader className="text-center pt-8">
          <CardTitle className="text-2xl font-bold tracking-tight">Nạp tiền vào ví</CardTitle>
          <CardDescription className="pt-2">
            Nhập số tiền bạn muốn nạp. Số tiền tối thiểu là 10.000đ. Giao dịch được xử lý tự động qua PayOS.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center space-x-3 py-4">
            <div className="grid flex-1 gap-2 leading-none">
              <Input
                type="number"
                placeholder="Ví dụ: 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg py-6 rounded-xl border-slate-300 dark:border-slate-800"
              />
            </div>
            <span className="text-muted-foreground font-medium text-lg shrink-0">VNĐ</span>
          </div>
        </CardContent>
        <CardFooter className="pb-8">
          <Button 
            type="button" 
            onClick={handleTopup} 
            disabled={isSubmitting || !amount || Number(amount) < 10000} 
            className="w-full py-6 text-base font-semibold rounded-xl"
          >
            {isSubmitting ? 'Đang tạo thanh toán...' : 'Nạp tiền ngay'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

import { useMemo, useState } from 'react'
import { CloudUpload, FileImage, ShieldCheck, Sparkles } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function OwnerEvidence() {
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState('Xác nhận thanh toán và quyền truy cập đã được cung cấp đầy đủ.')

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])

  return (
    <DashboardLayout
      role="owner"
      title="Tải bằng chứng"
      description="Gửi ảnh/chứng từ để đảm bảo giao dịch minh bạch và đáng tin cậy."
    >
      <div className="space-y-6 bg-[#f0f9ff]">
        <div className="rounded-3xl border border-sky-100/80 bg-white p-6 shadow-sm shadow-sky-100/50">
          <Badge className="rounded-full bg-sky-100 text-sky-700 hover:bg-sky-100">Upload Evidence</Badge>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Tải bằng chứng</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Một giao diện đơn giản, nhẹ nhàng và đủ tin cậy để bạn gửi bằng chứng giao dịch một cách rõ ràng.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="rounded-3xl border-slate-200/70 bg-white shadow-sm shadow-sky-100/30">
            <CardHeader>
              <CardTitle className="text-slate-900">Khu vực tải lên</CardTitle>
              <CardDescription>Kéo thả ảnh hoặc bấm để chọn file từ máy tính.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <label className="group block cursor-pointer">
                <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-sky-200 bg-sky-50/70 p-6 text-center transition-colors hover:border-sky-300 hover:bg-sky-50">
                  <div className="flex size-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-sky-100">
                    <CloudUpload className="size-7 text-sky-500" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-900">Kéo và thả bằng chứng vào đây</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Hỗ trợ ảnh PNG, JPG, JPEG. Bằng chứng rõ ràng sẽ giúp xử lý nhanh hơn.
                  </p>
                  <Button className="mt-5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700">
                    Chọn file
                  </Button>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>

              <div className="grid gap-2">
                <Label className="text-slate-700">Ghi chú bằng chứng</Label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[120px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400"
                  placeholder="Mô tả ngắn gọn nội dung bằng chứng..."
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                  Lưu nháp
                </Button>
                <Button className="rounded-full bg-coral-500 text-white hover:bg-coral-600">
                  <ShieldCheck className="mr-2 size-4" />
                  Xác nhận và Gửi
                </Button>
              </div>

              <p className="text-sm text-slate-500">Sự minh bạch giúp cộng đồng bền vững hơn.</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200/70 bg-white shadow-sm shadow-sky-100/30">
            <CardHeader>
              <CardTitle className="text-slate-900">Preview</CardTitle>
              <CardDescription>Xem trước ảnh bằng chứng trước khi gửi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                  <FileImage className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">{file?.name ?? 'Chưa có file nào được chọn'}</p>
                  <p className="text-sm text-slate-500">{file ? `${Math.round(file.size / 1024)} KB` : 'Ảnh sẽ hiển thị ở đây.'}</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                {previewUrl ? (
                  <img src={previewUrl} alt="Evidence preview" className="h-[320px] w-full object-cover" />
                ) : (
                  <div className="flex h-[320px] flex-col items-center justify-center p-6 text-center">
                    <div className="flex size-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                      <Sparkles className="size-6 text-slate-300" />
                    </div>
                    <p className="mt-4 font-medium text-slate-700">Chưa có preview</p>
                    <p className="mt-1 text-sm text-slate-500">Chọn một ảnh để xem trước tại đây.</p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-sky-50 p-4 text-sm leading-6 text-sky-700">
                Hãy đảm bảo ảnh rõ nét, đầy đủ thông tin và không bị cắt mất chi tiết quan trọng.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

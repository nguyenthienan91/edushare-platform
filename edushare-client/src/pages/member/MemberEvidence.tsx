import { useMemo, useState } from 'react'
import { CloudUpload, FileImage, ShieldCheck, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function MemberEvidence() {
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState('Xác nhận thanh toán và quyền truy cập đã được cung cấp đầy đủ.')

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])

  return (
    <div className='space-y-6 '>
      <Card>
        <CardContent>
          <Badge className='rounded-full' variant='secondary'>Upload Evidence</Badge>
          <h2 className='mt-3 text-3xl font-semibold tracking-tight '>Tải bằng chứng</h2>
          <p className='mt-2 max-w-2xl text-sm leading-6 '>
            Một giao diện đơn giản, nhẹ nhàng và đủ tin cậy để bạn gửi bằng chứng giao dịch một cách rõ ràng.
          </p>
        </CardContent>
      </Card>

      <div className='grid gap-6 lg:grid-cols-[1.15fr_0.85fr]'>
        <Card>
          <CardHeader>
            <CardTitle className=''>Khu vực tải lên</CardTitle>
            <CardDescription>Kéo thả ảnh hoặc bấm để chọn file từ máy tính.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-5'>
            <label className='group block cursor-pointer'>
              <div className='flex min-h-[280px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-sky-200 p-6 text-center transition-colors hover:border-sky-300 hover:bg-sky-500/5'>
                <div className='flex size-16 items-center justify-center rounded-full ring-1 ring-sky-100'>
                  <CloudUpload className='size-7 text-sky-500' />
                </div>
                <h3 className='mt-5 text-xl font-semibold '>Kéo và thả bằng chứng vào đây</h3>
                <p className='mt-2 max-w-md text-sm leading-6 '>
                  Hỗ trợ ảnh PNG, JPG, JPEG. Bằng chứng rõ ràng sẽ giúp xử lý nhanh hơn.
                </p>
                <Button className='mt-5 rounded-md'>Chọn file</Button>
              </div>
              <Input
                type='file'
                accept='image/*'
                className='hidden'
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>

            <div className='grid gap-2'>
              <Label className=''>Ghi chú bằng chứng</Label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className='min-h-[120px] rounded-lg border px-4 py-3 text-sm outline-none transition-colors focus:border-primary'
                placeholder='Mô tả ngắn gọn nội dung bằng chứng...'
              />
            </div>

            <div className='flex flex-wrap items-center gap-3'>
              <Button
                variant='outline'
                className='rounded-md'
              >
                Lưu nháp
              </Button>
              <Button className='rounded-md'>
                <ShieldCheck className='mr-2 size-4' />
                Xác nhận và Gửi
              </Button>
            </div>
            <p className='text-sm '>Sự minh bạch giúp cộng đồng bền vững hơn.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className=''>Preview</CardTitle>
            <CardDescription>Xem trước ảnh bằng chứng trước khi gửi.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-3 rounded-lg border p-4 bg-muted/20'>
              <div className='flex size-12 items-center justify-center rounded-lg bg-sky-100 text-sky-600'>
                <FileImage className='size-5' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate font-medium '>{file?.name ?? 'Chưa có file nào được chọn'}</p>
                <p className='text-sm '>
                  {file ? `${Math.round(file.size / 1024)} KB` : 'Ảnh sẽ hiển thị ở đây.'}
                </p>
              </div>
            </div>

            <div className='overflow-hidden rounded-lg border'>
              {previewUrl ? (
                <img src={previewUrl} alt='Evidence preview' className='h-[320px] w-full object-cover' />
              ) : (
                <div className='flex h-[320px] flex-col items-center justify-center p-6 text-center'>
                  <div className='flex size-14 items-center justify-center rounded-full ring-1 ring-border'>
                    <Sparkles className='size-6 text-muted-foreground/30' />
                  </div>
                  <p className='mt-4 font-medium '>Chưa có preview</p>
                  <p className='mt-1 text-sm '>Chọn một ảnh để xem trước tại đây.</p>
                </div>
              )}
            </div>

            <div className='rounded-lg border p-4 text-sm leading-6 text-sky-700 bg-sky-500/10'>
              Hãy đảm bảo ảnh rõ nét, đầy đủ thông tin và không bị cắt mất chi tiết quan trọng.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

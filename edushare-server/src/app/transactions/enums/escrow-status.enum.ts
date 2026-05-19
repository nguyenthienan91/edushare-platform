export enum EscrowStatus {
  PENDING = 'pending', // Người mua đang tiến hành thanh toán
  HELD_IN_ESCROW = 'held', // Tiền đã vào ví treo hệ thống (giữ trong 24h-48h)
  PROOF_SUBMITTED = 'proof', // Chủ nhóm đã upload minh chứng thành công
  COMPLETED = 'completed', // Người mua xác nhận HOẶC hết hạn 48h -> giải ngân
  REFUNDED = 'refunded', // Giao dịch thất bại/tranh chấp -> hoàn tiền cho người mua
  DISPUTED = 'disputed', // Có khiếu nại, chờ Admin xử lý
  APPROVED_WAITING_PROOF = 'approved_waiting_proof',
}

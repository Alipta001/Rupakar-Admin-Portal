export type PaymentGatewayStatus = 'Captured' | 'Authorized' | 'Failed' | 'Refunded' | 'Pending'

export interface Payment {
  id: string
  orderId: string
  orderNumber: string
  customer: string
  amount: number
  formattedAmount: string
  gateway: 'Razorpay' | 'Cash on Delivery' | 'Manual'
  gatewayTransactionId?: string
  status: PaymentGatewayStatus
  failureReason?: string
  date: string
  createdAt?: string
}

export interface Refund {
  id: string
  orderId: string
  orderNumber: string
  customer: string
  amount: number
  formattedAmount: string
  reason: string
  status: 'Completed' | 'Pending' | 'Rejected' | 'Processing'
  gatewayReference?: string
  date: string
}

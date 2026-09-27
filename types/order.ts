export type OrderStatus =
  | 'Pending'
  | 'Processing'
  | 'Confirmed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded'

export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded'

export interface OrderItem {
  id: string
  title: string
  quantity: number
  price: number
  vendorName: string
  vendorId?: string
  sku?: string
  image?: string
}

export interface VendorSubOrder {
  id: string
  vendorId: string
  vendorName: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  status: OrderStatus
  trackingNumber?: string
  courier?: string
}

export interface Order {
  id: string
  orderNumber: string
  customer: string
  customerEmail?: string
  customerPhone?: string
  itemSummary: string
  vendor: string
  vendorOrders?: VendorSubOrder[]
  amount: number
  formattedAmount: string
  status: OrderStatus
  paymentStatus?: PaymentStatus
  date: string
  shippingAddress?: string
  itemsCount?: number
}

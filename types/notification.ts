export interface AdminNotification {
  id: string
  _id?: string
  title: string
  message: string
  type: 'ORDER' | 'VENDOR' | 'PRODUCT' | 'PAYMENT' | 'SYSTEM' | 'SECURITY' | string
  link?: string
  read: boolean
  readAt?: string | null
  createdAt: string
  metadata?: Record<string, any>
}

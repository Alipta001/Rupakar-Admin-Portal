export interface AdminNotification {
  id: string
  _id?: string
  title: string
  message: string
  type: 'ORDER' | 'VENDOR' | 'PRODUCT' | 'PAYMENT' | 'SYSTEM' | 'SECURITY'
  link?: string
  read: boolean
  createdAt: string
}

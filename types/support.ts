export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

export interface SupportTicketMessage {
  id?: string
  _id?: string
  senderUserId?: string | { _id: string; name?: string; fullName?: string; email?: string }
  senderId?: string
  senderRole: 'customer' | 'vendor' | 'admin' | string
  senderName?: string
  message: string
  createdAt: string
}

export interface SupportTicket {
  id: string
  _id?: string
  ticketNumber?: string
  userId?: string | { _id: string; name?: string; fullName?: string; email?: string }
  userName?: string
  userEmail?: string
  vendorId?: string | { _id: string; businessName?: string; storeName?: string; storeEmail?: string; ownerUserId?: string }
  vendorName?: string
  vendorEmail?: string
  subject: string
  category: string
  priority: TicketPriority
  status: TicketStatus
  orderId?: any
  productId?: any
  assignedTo?: string | { _id: string; name?: string; fullName?: string; email?: string } | null
  messages?: SupportTicketMessage[]
  createdAt: string
  updatedAt?: string
}

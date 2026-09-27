export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

export interface SupportTicketMessage {
  id: string
  _id?: string
  senderId: string
  senderRole: string
  senderName: string
  message: string
  createdAt: string
}

export interface SupportTicket {
  id: string
  _id?: string
  ticketNumber?: string
  userId?: string
  userName?: string
  userEmail?: string
  vendorId?: string
  vendorName?: string
  subject: string
  category: string
  priority: TicketPriority
  status: TicketStatus
  assignedTo?: string
  messages?: SupportTicketMessage[]
  createdAt: string
  updatedAt?: string
}
